import { useState, useEffect } from "react";

const backend: "local" | "server" = process.env.REACT_APP_BACKEND === "server" ? "server" : "local";

export function useSyncingState<T>(
  initialState: T,
  key: string
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initialState);
  const [lastSync, setLastSync] = useState<number>(0);
  const [prevPushState, setPrevPushState] = useState("");
  const [initialValue, setInitialValue] = useState<T>(state);
  const [stateConnected, setStateConnected] = useState(true);
  const [loaded, setLoaded] = useState(false);
  // const [countSyncErrors, setCountSyncErrors] = useState(0);
  // const maxSyncErrors = 5;

  // if(countSyncErrors > maxSyncErrors) {
  //   setStateConnected(false);
  // };

  // Initialize the state
  useEffect(() => {
    async function load() {
      console.log(`Loading ${key}`);
      // Load from local storage in serverless deploys
      if (backend === "local") {
        let dump = localStorage.getItem(key);
        let data = dump ? JSON.parse(dump) : initialValue;
        setState(data);
        setLoaded(true);
        return;
      } else if (backend === "server") {
        // Otherwise load from the server
        let res = await fetch(`/api/data/${key}`);
        if (!res.ok) {
          console.error(`GET ${key} failed with status code ${res.status}`);
          // alert(`Error loading "${key}" state from data store.`)
          return;
        }
        let data = await res.json();
        setState(data);
        setLoaded(true);
        console.log(`Loaded "${key}" state from data store`);
      }
    }
    load();
  }, [key, stateConnected, initialValue]);

  // Watch file on server and pull when it changes
  useEffect(() => {
    let id = setInterval(() => {
      async function pullOnChange() {
        // console.log(`Running pullOnChange for ${key}`);
        // In serverless deploys, data is stored locally by a single client so
        // there's no need to pull changes.
        if (backend === "local") {
          return;
        } else if (backend === "server") {
          // Pull the file if it's been modified since we last synced
          try {
            let res = await fetch(`/api/data/${key}`, { method: "HEAD" });
            if (!res.ok) {
              throw new Error(`HEAD ${key} failed with status code ${res.status}`);
            }
            // setStateConnected(true);
            let lastModified = new Date(res.headers.get("Last-Modified") || "").getTime();
            if (lastModified > lastSync) {
              let res = await fetch(`/api/data/${key}`);
              if (!res.ok) {
                throw new Error(`GET ${key} failed with status code ${res.status}`);
              }
              let lastModified = new Date(res.headers.get("Last-Modified") || "").getTime();
              let data = await res.json();
              setState(data);
              setLastSync(lastModified);
              setLoaded(true);
              console.log(`Pulled "${key}" state from data store`);
            }
          } catch (err) {
            // setCountSyncErrors(n => n + 1)
            let message = `Failed to pull ${key} state from data store.`;
            console.error(message, err);
            // alert(message)
          }
        }
      }
      pullOnChange();
    }, 1000);
    return () => clearInterval(id);
  }, [key, lastSync, stateConnected]);

  // Push state to server when it changes
  useEffect(() => {
    async function pushOnChange() {
      // console.log(`Running pushOnChange for ${key}`);
      const currentState = JSON.stringify(state);
      if (currentState === prevPushState) {
        return;
      }
      // Persist in local storage for serverless deploys
      if(backend === "local") {
        localStorage.setItem(key, currentState);
        setLastSync(Date.now());
        setPrevPushState(currentState);
        return;
      } else if (backend === "server") {
        // Otherwise push to the server
        try {
          let res = await fetch(`/api/data/${key}`, {
            method: "POST",
            body: currentState,
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) {
            throw new Error(`POST ${key} failed with status code ${res.status}`);
          }
          let lastModified = new Date(res.headers.get("Last-Modified") || "").getTime();
          setLastSync(lastModified);
          setPrevPushState(currentState);
          console.log(`Pushed "${key}" state to data store.`);
        } catch (err) {
          // setCountSyncErrors(n => n + 1)
          let message = `Failed to push ${key} state to data store.`;
          console.error(message, err);
          // alert(message)
        }
      }
    }
    if(loaded && stateConnected) {
      pushOnChange();
    }
  }, [key, state, prevPushState, stateConnected, loaded]);

  return [state, setState, stateConnected];
}
