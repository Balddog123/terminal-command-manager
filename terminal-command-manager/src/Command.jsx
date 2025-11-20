import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { updateCommand } from "./CommandsHelpers";

/**
 * Command.jsx
 *
 * - Uses updateByPath + handleInputChange to safely update nested fields.
 * - Auto-creates nested objects when writing to them.
 * - Auto-deletes objects when they become "empty".
 * - Collapsible UI sections auto-expand when data exists or user edits them.
 */

/* ---------- Utilities ---------- */

// shallow-clone and deep-create path; returns new object (immutable)
const updateByPath = (obj, path, value) => {
  const keys = path === "" ? [] : path.split(".");
  // handle top-level set (path === "")
  if (keys.length === 0) {
    // replace whole object
    return value;
  }

  // clone root
  const newObj = Array.isArray(obj) ? [...obj] : { ...(obj ?? {}) };
  let curr = newObj;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];

    if (i === keys.length - 1) {
      // last key -> set value
      curr[k] = value;
    } else {
      // ensure next level exists and is cloned
      const next = curr[k];
      curr[k] = Array.isArray(next) ? [...next] : { ...(next ?? {}) };
      curr = curr[k];
    }
  }

  return newObj;
};

// Determines if a set_session_data-like object is "empty" (meaning we can remove it)
const isSetSessionDataEmpty = (ssd) => {
  if (!ssd) return true;
  const nameEmpty = !ssd.name || String(ssd.name).trim() === "";
  const valueEmpty = ssd.value === "" || ssd.value === null || ssd.value === undefined;
  // requiredAct is optional; treat missing or 0 as empty
  const requiredActEmpty = ssd.requiredAct === undefined || ssd.requiredAct === null || ssd.requiredAct === 0;
  // requiredSessionData may exist; check it's empty
  const rsd = ssd.requiredSessionData;
  const rsdEmpty = !rsd || (
    (!rsd.name || String(rsd.name).trim() === "") &&
    (rsd.value === "" || rsd.value === null || rsd.value === undefined)
  );

  // If both name and value are empty, and nested requiredSessionData empty, consider empty
  return nameEmpty && valueEmpty && rsdEmpty && requiredActEmpty;
};

// Determines if a required_session_data-like object is empty
const isRequiredSessionDataEmpty = (rsd) => {
  if (!rsd) return true;
  const nameEmpty = !rsd.name || String(rsd.name).trim() === "";
  const valueEmpty = rsd.value === "" || rsd.value === null || rsd.value === undefined;
  return nameEmpty && valueEmpty;
};



/* ---------- Main Command Component ya'll ---------- */

function Command() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Auto resize text fields that are large
  const textRef = useRef(null);

  const autoResize = (el) => {
    if (!el) return;
    el.style.height = "auto";        // reset to shrink if needed
    el.style.height = `${el.scrollHeight}px`; // resize to content
  };

  const initial = location.state?.commandData || {
    terminal_num: [],
    text: "",
    require_act: 0,
    video: "",
    media_scale: "",
    image: "",
    audio: "",
    url: "",
    html: "",
    debug_only: false,
    // set_session_data: null,
    // required_session_data: null,
  };

  const [commandData, setCommand] = useState(initial);
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [fetchId, setFetchId] = useState(id);
  const [key, setKey] = useState(location.state?.key ?? id);

  // UI collapse state for sections. Auto-expand rules below (useEffect).
  const [expanded, setExpanded] = useState({
    setSessionData: !!initial.set_session_data,
    setSessionRequired: !!(initial.set_session_data?.requiredSessionData),
    requiredSessionData: !!initial.required_session_data,
  });

  // Sync expanded state when commandData changes (auto expand when object exists; collapse when removed)
  useEffect(() => {
    setExpanded(prev => ({
      setSessionData: prev.setSessionData || !!commandData.set_session_data,
      setSessionRequired: prev.setSessionRequired || !!commandData.set_session_data?.requiredSessionData,
      requiredSessionData: prev.requiredSessionData || !!commandData.required_session_data,
    }));
  }, [commandData.set_session_data, commandData.required_session_data]);

  //auto resize useEffect
  useEffect(() => {
    autoResize(textRef.current);
  }, [commandData.text]);


  /* Generic change handler using path strings */
  const handleInputChange = (path, value) => {
    setSaveEnabled(true);

    // We'll update based on previous state to avoid issues with stale state
    setCommand(prev => {
      let next = updateByPath(prev, path, value);

      // After update, do cleanup: remove set_session_data if empty; remove required_session_data if empty
      if (next.set_session_data && isSetSessionDataEmpty(next.set_session_data)) {
        const copy = { ...next };
        delete copy.set_session_data;
        next = copy;
      }

      if (next.required_session_data && isRequiredSessionDataEmpty(next.required_session_data)) {
        const copy = { ...next };
        delete copy.required_session_data;
        next = copy;
      }

      // If we accidentally set a requiredSessionData to empty, remove it
      if (next.set_session_data?.requiredSessionData && (
        isRequiredSessionDataEmpty(next.set_session_data.requiredSessionData)
      )) {
        const copy = { ...next, set_session_data: { ...next.set_session_data } };
        delete copy.set_session_data.requiredSessionData;
        next = copy;
      }

      return next;
    });
  };

  /* Add / Remove helpers */
  const addSetSessionData = () => {
    setSaveEnabled(true);
    setCommand(prev =>
      updateByPath(prev, "set_session_data", { name: "", value: "", requiredAct: 0 })
    );
    setExpanded(prev => ({ ...prev, setSessionData: true }));
  };

  const removeSetSessionData = () => {
    setSaveEnabled(true);
    setCommand(prev => {
      const copy = { ...(prev ?? {}) };
      delete copy.set_session_data;
      return copy;
    });
    setExpanded(prev => ({ ...prev, setSessionData: false, setSessionRequired: false }));
  };

  const addSetSessionRequiredData = () => {
    setSaveEnabled(true);
    setCommand(prev =>
      updateByPath(prev, "set_session_data.requiredSessionData", { name: "", value: "" })
    );
    setExpanded(prev => ({ ...prev, setSessionRequired: true, setSessionData: true }));
  };

  const removeSetSessionRequiredData = () => {
    setSaveEnabled(true);
    setCommand(prev => {
      if (!prev.set_session_data) return prev;
      const copy = { ...prev, set_session_data: { ...prev.set_session_data } };
      delete copy.set_session_data.requiredSessionData;
      return copy;
    });
    setExpanded(prev => ({ ...prev, setSessionRequired: false }));
  };

  const addRequiredSessionData = () => {
    setSaveEnabled(true);
    setCommand(prev => updateByPath(prev, "required_session_data", { name: "", value: "" }));
    setExpanded(prev => ({ ...prev, requiredSessionData: true }));
  };

  const removeRequiredSessionData = () => {
    setSaveEnabled(true);
    setCommand(prev => {
      const copy = { ...(prev ?? {}) };
      delete copy.required_session_data;
      return copy;
    });
    setExpanded(prev => ({ ...prev, requiredSessionData: false }));
  };

  /* Submit */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveEnabled(false);

    await updateCommand(fetchId, {
      key: key,
      objectData: commandData
    });

    if (key !== fetchId) {
      setFetchId(key);
    }

    navigate("/commands");
  };

  /* Utility: convert boolean selected as boolean (for debug_only field)*/
  const boolFromSelect = (v) => (v === "true" || v === true);

  return (
    <form onSubmit={handleUpdate}>
      <Link to={`/commands`}>Return to Commands</Link>
      <p> </p>

      <div className="command-container">
        <div className="command-grid">
          <div className="command-row">
            <label className="command-sectiontitle">Terminal Command</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={key}
              onChange={(e) => { setSaveEnabled(true); setKey(e.target.value); }}
            />
          </div>

          <div className="command-row">
            <label>Terminal Type</label>
            <select
              id={"terminal_num-" + id}
              multiple
              value={commandData.terminal_num ?? []}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, (opt) =>
                  parseInt(opt.value, 10)
                );
                handleInputChange("terminal_num", selectedValues);
              }}
            >
              <option value={0}>First</option>
              <option value={1}>PixelDMN</option>
            </select>
          </div>

          {/* === Server Side Control*/}
          <hr/>
          <div className="command-row section-break"><label className="command-sectiontitle">Server Side Control</label></div>
          <div className="command-row">
            <label>Debug Only</label>
            <select
              id={"debug_only-" + id}
              value={String(commandData.debug_only ?? false)}
              onChange={(e) => handleInputChange("debug_only", boolFromSelect(e.target.value))}
            >
              <option value={false}>False</option>
              <option value={true}>True</option>
            </select>
          </div>
          <div className="command-row">
            <label>Require Act</label>
            <input
              type="number"
              className="table-input"
              value={commandData.require_act ?? ""}
              onChange={(e) => handleInputChange("require_act", Number(e.target.value))}
            />
          </div>

          {/* ---------- set_session_data section (collapsible) ---------- */}
          <div className="command-row">
            <label>Set Session Data</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setExpanded(prev => ({ ...prev, setSessionData: !prev.setSessionData }))}
                >
                  {expanded.setSessionData ? "▾" : "▸"}
                </button>

                {!commandData.set_session_data ? (
                  <button type="button" onClick={addSetSessionData}>Add set_session_data</button>
                ) : (
                  <button type="button" onClick={removeSetSessionData}>Remove set_session_data</button>
                )}
              </div>

              {expanded.setSessionData && commandData.set_session_data && (
                <div style={{ paddingLeft: "18px", borderLeft: "2px solid #eee" }}>
                  <div>
                    <label>Name:</label>
                    <textarea
                      className="table-textarea"
                      rows={1}
                      value={commandData.set_session_data?.name ?? ""}
                      onChange={(e) => {
                        setExpanded(prev => ({ ...prev, setSessionData: true }));
                        handleInputChange("set_session_data.name", e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label>Value:</label>
                    <textarea
                      className="table-textarea"
                      rows={1}
                      value={commandData.set_session_data?.value ?? ""}
                      onChange={(e) => {
                        setExpanded(prev => ({ ...prev, setSessionData: true }));
                        // keep raw string unless you want coercion elsewhere
                        handleInputChange("set_session_data.value", e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label>Required Act:</label>
                    <input
                      type="number"
                      className="table-input"
                      value={commandData.set_session_data?.requiredAct ?? 0}
                      onChange={(e) => {
                        setExpanded(prev => ({ ...prev, setSessionData: true }));
                        handleInputChange("set_session_data.requiredAct", Number(e.target.value));
                      }}
                    />
                  </div>

                  {/* Nested requiredSessionData inside set_session_data */}
                  <div style={{ marginTop: "8px" }}>
                    <strong>Required Session Data (for this set)</strong>
                    <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setExpanded(prev => ({ ...prev, setSessionRequired: !prev.setSessionRequired }))}
                      >
                        {expanded.setSessionRequired ? "▾" : "▸"}
                      </button>

                      {!commandData.set_session_data?.requiredSessionData ? (
                        <button type="button" onClick={addSetSessionRequiredData}>Add requiredSessionData</button>
                      ) : (
                        <button type="button" onClick={removeSetSessionRequiredData}>Remove requiredSessionData</button>
                      )}
                    </div>

                    {expanded.setSessionRequired && commandData.set_session_data?.requiredSessionData && (
                      <div style={{ paddingLeft: "18px", borderLeft: "2px dashed #eee", marginTop: "6px" }}>
                        <div>
                          <label>Name:</label>
                          <textarea
                            className="table-textarea"
                            rows={1}
                            value={commandData.set_session_data.requiredSessionData?.name ?? ""}
                            onChange={(e) => {
                              setExpanded(prev => ({ ...prev, setSessionRequired: true, setSessionData: true }));
                              handleInputChange("set_session_data.requiredSessionData.name", e.target.value);
                            }}
                          />
                        </div>

                        <div>
                          <label>Value:</label>
                          <textarea
                            className="table-textarea"
                            rows={1}
                            value={commandData.set_session_data.requiredSessionData?.value ?? ""}
                            onChange={(e) => {
                              setExpanded(prev => ({ ...prev, setSessionRequired: true, setSessionData: true }));
                              handleInputChange("set_session_data.requiredSessionData.value", e.target.value);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---------- required_session_data (top-level) ---------- */}
          <div className="command-row">
            <label>Required Session Data (top-level)</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setExpanded(prev => ({ ...prev, requiredSessionData: !prev.requiredSessionData }))}
                >
                  {expanded.requiredSessionData ? "▾" : "▸"}
                </button>

                {!commandData.required_session_data ? (
                  <button type="button" onClick={addRequiredSessionData}>Add required_session_data</button>
                ) : (
                  <button type="button" onClick={removeRequiredSessionData}>Remove required_session_data</button>
                )}
              </div>

              {expanded.requiredSessionData && commandData.required_session_data && (
                <div style={{ paddingLeft: "18px", borderLeft: "2px solid #eee" }}>
                  <div>
                    <label>Name:</label>
                    <textarea
                      className="table-textarea"
                      rows={1}
                      value={commandData.required_session_data?.name ?? ""}
                      onChange={(e) => {
                        setExpanded(prev => ({ ...prev, requiredSessionData: true }));
                        handleInputChange("required_session_data.name", e.target.value);
                      }}
                    />
                  </div>

                  <div>
                    <label>Value:</label>
                    <textarea
                      className="table-textarea"
                      rows={1}
                      value={commandData.required_session_data?.value ?? ""}
                      onChange={(e) => {
                        setExpanded(prev => ({ ...prev, requiredSessionData: true }));
                        handleInputChange("required_session_data.value", e.target.value);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* === Terminal Management*/}
          <hr/>
          <div className="command-row section-break"><label className="command-sectiontitle">Terminal Management</label></div>
          <div className="command-row">
            <label>Input Flag</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.input_flag ?? ""}
              onChange={(e) => handleInputChange("input_flag", e.target.value)}
            />
          </div>
          <div className="command-row">
            <label>Prompt</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="prompt"
              value={commandData.prompt ?? ""}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
            />
          </div>

          {/* === Terminal Content*/}
          <hr/>
          <div className="command-row section-break"><label className="command-sectiontitle">Terminal Content</label></div>
          <div className="command-row">
            <label>Response Text</label>
            <textarea
              ref={textRef}
              className="table-textarea"
              value={commandData.text ?? ""}
              onChange={(e) => {
                handleInputChange("text", e.target.value);
                autoResize(e.target);
              }}
              style={{
                overflow: "hidden",
                resize: "none"
              }}
            />
          </div>    
          <div className="command-row">
            <label>HTML</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.html ?? ""}
              onChange={(e) => handleInputChange("html", e.target.value)}
            />
          </div>
          
          {/* === External Content*/}
          <hr/>
          <div className="command-row section-break"><label className="command-sectiontitle">External Content</label></div>
          <div className="command-row">
            <label>URL</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.url ?? ""}
              onChange={(e) => handleInputChange("url", e.target.value)}
            />
          </div>
          <div className="command-row">
            <label>Audio</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.audio ?? ""}
              onChange={(e) => handleInputChange("audio", e.target.value)}
            />
          </div>
          <div className="command-row">
            <label>Video</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.video ?? ""}
              onChange={(e) => handleInputChange("video", e.target.value)}
            />
          </div>
          <div className="command-row">
            <label>Image</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.image ?? ""}
              onChange={(e) => handleInputChange("image", e.target.value)}
            />
          </div><div className="command-row">
            <label>Media Scale</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.media_scale ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                handleInputChange("media_scale", v === "" ? "" : parseFloat(v));
              }}
            />
          </div>
        </div>

        <input type="submit" value="Save Changes" disabled={!saveEnabled} />
      </div>
    </form>
  );
}

export default Command;
