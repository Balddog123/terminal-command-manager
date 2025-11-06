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
  });
  const [fetchId, setFetchId] = useState(id)
  const [key, setKey] = useState(location.state?.key);

  const handleInputChange = (matchKey, field, value) =>{
    setSaveEnabled(true);
    console.log(`Input changing: ${commandData}`);
    setCommand(prev => ({
      ...prev,
      [field]: value
    }));

    console.log(`Input result: ${commandData}`);
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
                handleInputChange(id, "terminal_num", selectedValues);
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
              onChange={(e) => handleInputChange(id, "text", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Require Act</label>
            <input
              type="number"
              className="table-input"
              value={commandData.require_act ?? ""}
              onChange={(e) =>
                handleInputChange(id, "require_act", Number(e.target.value))
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
              onChange={(e) => handleInputChange(id, "video", e.target.value)}
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
                handleInputChange(id, "media_scale", parseFloat(e.target.value))
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
              onChange={(e) => handleInputChange(id, "image", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Audio</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.audio}
              onChange={(e) => handleInputChange(id, "audio", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>URL</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.url}
              onChange={(e) => handleInputChange(id, "url", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>HTML</label>
            <textarea
              className="table-textarea"
              rows={1}
              type="text"
              value={commandData.html}
              onChange={(e) => handleInputChange(id, "html", e.target.value)}
            />
          </div>

          <div className="command-row">
            <label>Debug Only</label>
            <select
              id={"debug_only-" + id}
              value={commandData.debug_only}
              onChange={(e) =>
                handleInputChange(id, "debug_only", e.target.value === "true")
              }
            >
              <option value={false}>False</option>
              <option value={true}>True</option>
            </select>
          </div>
        </div>
        <input type="submit" value="Save Changes" disabled={!saveEnabled}/>
      </div>
    </form>
    
  );
}

export default Command;
