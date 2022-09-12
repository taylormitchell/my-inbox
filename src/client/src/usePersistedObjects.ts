import { useState, useEffect, useCallback } from "react";
import _ from "lodash";

export type ObjectKey = string;
export type Objects = { [key: ObjectKey]: { [key: string | number | symbol]: any } };

/**
 * Returns an object of objects that are persisted to the server and a function to update it.
 *
 * This hook is not thread safe. It is not safe to call this hook from multiple components.
 * @returns
 */
export const usePersistedObjects = (
  initialObjects = {},
  { pullInterval = 5000, pushInterval = 1000 } = {}
) => {
  const [objects, setObjects] = useState<Objects>(initialObjects);
  const [objectsToPush, setObjectsToPush] = useState<Set<ObjectKey>>(new Set());
  const [serverUp, setServerUp] = useState<boolean>(true);

  const [lastPull, setLastPull] = useState<number>(0);
  const [lastPush, setLastPush] = useState<number>(0);

  function mergeIntoObjects(objectsUpdate: Objects | ((objects: Objects) => Objects)) {
    setObjects((objects) => {
      if (typeof objectsUpdate === "function") {
        objectsUpdate = objectsUpdate(objects) as Objects;
      }
      setObjectsToPush((keys) => new Set([...keys, ...Object.keys(objectsUpdate)]));
      return _.merge(objects, objectsUpdate);
    });
  }

  // Sync functions

  const push = useCallback(async () => {
    if (objectsToPush.size === 0) return;

    const updatedObjects: Objects = {};
    objectsToPush.forEach((key) => (updatedObjects[key] = objects[key]));

    await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedObjects),
    });
    console.log("Pushed", updatedObjects);

    setObjectsToPush(new Set());
  }, [objects, objectsToPush, setObjectsToPush]);

  const pull = useCallback(async () => {
    if (objectsToPush.size > 0) return; // Don't pull if there are objects to push

    const response = await fetch("/api/db/new?since=" + lastPull);
    const { objects: newObjects } = await response.json();
    console.log("Pulled", newObjects);
    if (Object.keys(newObjects).length === 0) {
      return false;
    }
    setObjects((objects) => ({ ...objects, ...newObjects }));
    return true;
  }, [lastPull, objectsToPush]);

  const clone = async () => {
    const response = await fetch("/api/db/all");
    const { objects } = await response.json();
    setObjects((objs) => ({ ...objs, ...objects }));
  };

  const isServerUp = async () => {
    try {
      const response = await fetch("/api/db/health");
      return response.status === 200;
    } catch (err) {
      console.log("inside catch");
      return false;
    }
  };

  // Sync loops

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentServerUp = await isServerUp();
      if (currentServerUp !== serverUp) {
        console.log("server up:", currentServerUp);
        setServerUp(currentServerUp);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [serverUp]);

  useEffect(() => {
    clone();
  }, []);

  useEffect(() => {
    if (!serverUp) return;
    const now = Date.now();
    const nextPull = lastPull + pullInterval;
    const timeout = setTimeout(() => {
      pull();
      setLastPull(now);
    }, nextPull - now);
    return () => {
      clearTimeout(timeout);
    };
  }, [pull, lastPull, setLastPull, serverUp, pullInterval]);

  useEffect(() => {
    if (!serverUp) return;
    if (objectsToPush.size === 0) return;
    const now = Date.now();
    const nextPush = lastPush + pushInterval;
    const timeout = setTimeout(() => {
      push();
      setLastPush(now);
    }, nextPush - now);
    return () => clearTimeout(timeout);
  }, [push, lastPush, setLastPush, serverUp, objectsToPush, pushInterval]);

  return [objects, mergeIntoObjects] as const;
};
