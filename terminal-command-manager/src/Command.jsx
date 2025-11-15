import React, {useState} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { updateCommand } from "./CommandsHelpers";
import { Link } from "react-router-dom";

function Command() {
  const {id} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [saveEnabled, setSaveEnabled] = useState(false);
  const [commandData, setCommand] = useState(location.state?.commandData || {
    terminal_num: [],
    text: "",
    require_act: null,
    video: "",
    media_scale: "",
    image: "",
    audio: "",
    url: "",
    html: "",
    debug_only: false,
    set_session_data: null
  });
  const [fetchId, setFetchId] = useState(id)
  const [key, setKey] = useState(location.state?.key);

  const handleInputChange = (section, field, value) => {
    setSaveEnabled(true);

    // If updating set_session_data
    if (section === "set_session_data") {
      const existing = commandData.set_session_data || { name: "", value: "" };

      const updated = {
        ...existing,
        [field]: value
      };
      console.log(updated)
      if (
        String(updated.name ?? "").trim() === "" &&
        updated.value === 0
      ) {
        setCommand(prev => {
          const copy = { ...prev };
          delete copy.set_session_data;
          return copy;
        });
        return;
      }

      // Otherwise update normally
      setCommand(prev => ({
        ...prev,
        set_session_data: updated
      }));

      return;
    }

    // Default updater for all other fields
    setCommand(prev => ({
      ...prev,
      [section]: value
    }));
  };


  const handleCommandNameChange = (newKey) =>{
    setSaveEnabled(true);
    setKey(newKey);
  }

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaveEnabled(false);

    updateCommand(fetchId, {
      key : key,
      objectData: commandData
    });

    if(key !== fetchId){
      console.log(`New fetchID: ${key}`)
      setFetchId(key);
    }

    navigate("/commands");
  };

  return (
    <form onSubmit={handleUpdate}>
      <Link to={`/commands`} >Return to Commands</Link>
      <p> </p>
      <div className="command-container">
        <div className="command-grid">
          <div className="command-row">
            <label>Terminal Command</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={key}
              onChange={(e) => handleCommandNameChange(e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Terminal Type</label>
            <select
              id={"terminal_num-" + id}
              multiple
              value={commandData.terminal_num}
              onChange={(e) => {
                const selectedValues = Array.from(e.target.selectedOptions, (opt) =>
                  parseInt(opt.value, 10)
                );
                handleInputChange("", "terminal_num", selectedValues);
              }}
            >
              <option value={0}>First</option>
              <option value={1}>PixelDMN</option>
            </select>
          </div>

          <div className="command-row">
            <label>Response Text</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.text}
              onChange={(e) => handleInputChange("", "text", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Require Act</label>
            <input
              type="number"
              className="table-input"
              value={commandData.require_act ?? ""}
              onChange={(e) =>
                handleInputChange("", "require_act", Number(e.target.value))
              }
            />
          </div>

          <div className="command-row">
            <label>Video</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.video}
              onChange={(e) => handleInputChange("", "video", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Media Scale</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.media_scale}
              onChange={(e) =>
                handleInputChange("", "media_scale", parseFloat(e.target.value))
              }
            />
          </div>

          <div className="command-row">
            <label>Image</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.image}
              onChange={(e) => handleInputChange("", "image", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Audio</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.audio}
              onChange={(e) => handleInputChange("", "audio", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>URL</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.url}
              onChange={(e) => handleInputChange("", "url", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>HTML</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.html}
              onChange={(e) => handleInputChange("", "html", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Debug Only</label>
            <select
              id={"debug_only-" + id}
              value={commandData.debug_only}
              onChange={(e) =>
                handleInputChange("", "debug_only", e.target.value === "true")
              }
            >
              <option value={false}>False</option>
              <option value={true}>True</option>
            </select>
          </div>
          <div className="command-row">
            <label>Set Session Data</label>
            <div>
              Name:
            <textarea
              className="table-textarea"
              rows={1}
              value={commandData.set_session_data?.name ?? ""}
              onChange={(e) =>
                handleInputChange("set_session_data", "name", e.target.value)
              }
            /></div>
            <div>
              Value:
              <textarea
              className="table-textarea"
              rows={1}
              value={commandData.set_session_data?.value ?? ""}
              onChange={(e) =>
                handleInputChange("set_session_data", "value", Number(e.target.value))
              }
            />
            </div>
            
          </div>
        </div>
        <input type="submit" value="Save Changes" disabled={!saveEnabled}/>
      </div>
    </form>
    
  );
}

export default Command;
