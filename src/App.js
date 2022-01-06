import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import "./styles/App.css";
import { useCallback, useEffect, useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [outputDisplay, setOutputDisplay] = useState([]);
  const [output, setOutput] = useState({
    text: "In Indiana , downed tree limbs interrupted power in parts of Indianapolis .",
    ner_tags: [
      "O",
      "B-Loc",
      "O",
      "O",
      "O",
      "O",
      "O",
      "O",
      "O",
      "O",
      "O",
      "B-Loc",
      "O",
    ],
    entities: [
      {
        entity: "Loc",
        value: "Indiana",
        start_token: 1,
        end_token: 1,
      },
      {
        entity: "Loc",
        value: "Indianapolis",
        start_token: 11,
        end_token: 11,
      },
    ],
    relations: [
      {
        source_entity: {
          entity: "Loc",
          value: "Indiana",
          start_token: 1,
          end_token: 1,
        },
        target_entity: {
          entity: "Loc",
          value: "Indianapolis",
          start_token: 11,
          end_token: 11,
        },
        relation: "Located_In",
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  const handleChangeInput = (event) => {
    setInput(event.target.value);
  };

  const handleClickExtract = useCallback(async () => {
    setLoading(true);
    // await call api
    let encodedUrl = `http://localhost:8000/api/predict?text=${encodeURIComponent(input)}`
    let res = await fetch(encodedUrl);
    let resJson = await res.json();
    console.log(resJson);
    // await new Promise((resolve) => {
    //   setTimeout(resolve, 1500);
    // });
    setOutput(resJson);
    setLoading(false);
  }, [input]);

  useEffect(() => {
    let words = output.text.split(" ");
    output.entities.forEach((entity, index) => {
      let start_at = entity.start_token;
      let end_at = entity.end_token;
      let ner = entity.entity;

      for (let i = start_at + 1; i < end_at; i++) {
        words[start_at] += " " + words[i];
        words[i] = "";
      }

      words[start_at] += `<entity>${ner}</entity>`;
    });
    words = words.filter((word) => word !== "");
    words = words.map((word) => {
      if (word.endsWith("<entity>Loc</entity>")) {
        let replaced = word.replace(/<entity>Loc<\/entity>/g, "");
        return <div className="entity location">&nbsp;<span>{replaced}</span>&nbsp;</div>;
      } else if (word.endsWith("<entity>Peop</entity>")) {
        let replaced = word.replace(/<entity>Peop<\/entity>/g, "");
        return <div className="entity people">&nbsp;<span>{replaced}</span>&nbsp;</div>;
      } else if (word.endsWith("<entity>Org</entity>")) {
        let replaced = word.replace(/<entity>Org<\/entity>/g, "");
        return <div className="entity organization">&nbsp;<span>{replaced}</span>&nbsp;</div>;
      } else if (word.endsWith("<entity>Other</entity>")) {
        let replaced = word.replace(/<entity>Other<\/entity>/g, "");
        return <div className="entity other">&nbsp;<span>{replaced}</span>&nbsp;</div>;
      } else {
        return <div>&nbsp;<span>{word}</span>&nbsp;</div>;
      }
    });
    setOutputDisplay([...words]);
  }, [output]);

  return (
    <>
      <CssBaseline />
      <div className="header">
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Web Mining - Information Extraction Demo
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
      </div>
      <div className="container">
        <div className="input row">
          <div>
            <TextField
              label="Input text"
              variant="outlined"
              multiline
              rows={6}
              maxRows={6}
              value={input}
              fullWidth
              onChange={handleChangeInput}
            />
          </div>
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={handleClickExtract}
            >
              EXTRACT
            </LoadingButton>
          </div>
        </div>
        <div className="output row" style={{ flexDirection: "row", flex: "1" }}>
          <div className="column" style={{ display: "flex", flexFlow: "wrap", lineHeight: "2.75rem", fontSize: "1.25rem" }}>
            {outputDisplay}
          </div>
          <div className="column">

          </div>
        </div>
      </div>
    </>
  );
}
