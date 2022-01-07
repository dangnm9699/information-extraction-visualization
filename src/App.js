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
  const [input, setInput] = useState("In Indiana, downed tree limbs interrupted power in parts of Indianapolis.");
  const [entities, setEntities] = useState([]);
  const [relations, setRelations] = useState([]);
  const [output, setOutput] = useState({
    text: "In Indiana, downed tree limbs interrupted power in parts of Indianapolis.",
    tags: [
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
      "B-Loc"
    ],
    entities: [
      {
        entity: "Loc",
        value: "Indiana",
        start_token: 1,
        end_token: 2,
        start: 3,
        end: 10
      },
      {
        entity: "Loc",
        value: "Indianapolis",
        start_token: 10,
        end_token: 11,
        start: 60,
        end: 72
      },
    ],
    relations: [
      {
        source_entity: {
          entity: "Loc",
          value: "Indiana",
          start_token: 1,
          end_token: 2,
          start: 3,
          end: 10,
          index: 0
        },
        target_entity: {
          entity: "Loc",
          value: "Indianapolis",
          start_token: 10,
          end_token: 11,
          start: 60,
          end: 72,
          index: 1
        },
        relation: "Located_In",
        score: 0.6244240403175354
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
    let index = -1;
    words = words.map((word) => {
      if (word.endsWith("<entity>Loc</entity>")) {
        index += 1;
        let replaced = word.replace(/<entity>Loc<\/entity>/g, "");
        return <div className="entity location">&nbsp;<span><b>[{index}]</b>&nbsp;{replaced}</span>&nbsp;</div>;
      } else if (word.endsWith("<entity>Peop</entity>")) {
        index += 1;
        let replaced = word.replace(/<entity>Peop<\/entity>/g, "");
        return <div className="entity people">&nbsp;<span><b>[{index}]</b>&nbsp;{replaced}</span>&nbsp;</div>;
      } else if (word.endsWith("<entity>Org</entity>")) {
        index += 1;
        let replaced = word.replace(/<entity>Org<\/entity>/g, "");
        return <div className="entity organization">&nbsp;<span><b>[{index}]</b>&nbsp;{replaced}</span>&nbsp;</div>;
      } else if (word.endsWith("<entity>Other</entity>")) {
        index += 1;
        let replaced = word.replace(/<entity>Other<\/entity>/g, "");
        return <div className="entity other">&nbsp;<span><b>[{index}]</b>&nbsp;{replaced}</span>&nbsp;</div>;
      } else {
        return <div>&nbsp;<span>{word}</span>&nbsp;</div>;
      }
    });
    let relationsList = [];
    output.relations.forEach((relation, index) => {
      relationsList.push(
        <div key={`relation-${index}`} className="relation">
          <div>[{relation.source_entity.index}] {relation.source_entity.value}</div>
          <div>&nbsp;&rarr;&nbsp;</div>
          <div>[{relation.target_entity.index}] {relation.target_entity.value}</div>
          <div>&nbsp;:&nbsp;</div>
          <div>{relation.relation}</div>
        </div>
      )
    })
    setRelations([...relationsList]);
    setEntities([...words]);
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
          <div className="column" style={{ flexFlow: "wrap", lineHeight: "2.75rem", fontSize: "1.25rem", width: "70%" }}>
            {entities}
          </div>
          <div className="column" style={{ flexDirection: "column", width: "30%" }}>
            {relations}
          </div>
        </div>
      </div>
    </>
  );
}
