var axios = require("axios");
var FormData = require("form-data");
const multer = require("multer");
var fs = require("fs");
const express = require("express");
const app = express();
const cors = require("cors");
var bodyParser = require("body-parser");
var uniqid = require("uniqid");
var jsonParser = bodyParser.json();
var corsOptions = {
  origin: "FE_URL_HERE",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const upload = multer({ dest: "uploads/" });

app.use("/upload", upload.array("files"), async (req, res) => {
  var data = new FormData();
  const src = `uploads/` + req.files[0].filename;
  data.append("file", fs.createReadStream(src));
  data.append("pinataOptions", '{"cidVersion": 1}');
  data.append(
    "pinataMetadata",
    '{"name": "MyFile", "keyvalues": {"company": "Pinata"}}'
  );
  var config = {
    method: "post",
    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    headers: {
      Authorization:
        "Bearer PINATA_JWT_HERE",
      ...data.getHeaders(),
    },
    data: data,
  };
  const ress = await axios(config);
  fs.unlink(src, () => {
    res.send({
      status: "succeed",
      url: "https://BE_API_URL_HERE/ipfs/" + ress.data.IpfsHash,
    });
  });
});

app.use("/json", jsonParser, async (req, res) => {
  console.log(req.body);
  const id = uniqid();
  try {
    const ress = await axios({
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer PINATA_JWT_HERE",
      },
      data: JSON.stringify({
        pinataOptions: {
          cidVersion: 1,
        },
        pinataMetadata: {
          name: id,
        },
        pinataContent:{ ...req.body, id },
      }),
    });
    res.send({
      status: "succeed",
      url: "https://BE_API_URL_HERE/ipfs/" + ress.data.IpfsHash,
    });
  } catch (err) {
    console.log(err);
    res.send({ status: "err" });
  }
});

app.listen(process.env.PORT || 3002);
