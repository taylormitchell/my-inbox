import { useState, useEffect, useCallback } from "react";
import _ from "lodash";

export type ObjectKey = string;
export type Objects = { [key: ObjectKey]: { [key: string | number | symbol]: any } };

/**
 * Returns an object of objects that are persisted to the server and a function to update it.
 *
 * Note:
 * - This hook is not thread safe. It is not safe to call this hook from multiple components.
 * - Pulls stop while in-memory objects are changing and resumes after 5s of inactivity.
 * - Pushes stop while in-memory objects are changing and resumes after 1s of inactivity.
 * @returns
 */
export const usePersistedObjects = () => {
  const [objects, setObjects] = useState<Objects>({});
  const [objectsToPush, setObjectsToPush] = useState<Set<ObjectKey>>(new Set());
  const [lastPull, setLastPull] = useState<number>(0);
  const [serverUp, setServerUp] = useState<boolean>(true);

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
    if (objectsToPush.size === 0) {
      return;
    }
    const updatedObjects: Objects = {};
    objectsToPush.forEach((key) => (updatedObjects[key] = objects[key]));
    console.log("push", updatedObjects);

    await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedObjects),
    });

    setObjectsToPush(new Set());
  }, [objects, objectsToPush, setObjectsToPush]);

  const pull = useCallback(async () => {
    if (objectsToPush.size > 0) return;
    const thisPull = Date.now();
    const response = await fetch("/api/db/new?since=" + lastPull);
    const { objects: newObjects } = await response.json();
    console.log("pulled", newObjects);
    if (Object.keys(newObjects).length === 0) {
      return false;
    }
    setLastPull(thisPull);
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
    const interval = setInterval(pull, 5000);
    return () => clearInterval(interval);
  }, [pull, serverUp]);

  useEffect(() => {
    if (!serverUp) return;
    const interval = setInterval(push, 1000);
    return () => clearInterval(interval);
  }, [push, serverUp]);

  return [objects, mergeIntoObjects] as const;
};
