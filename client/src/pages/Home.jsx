import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.scss";
import TextWithMore from "../common/TextWithMore";

const Home = () => {
  const [inputData, setInputData] = useState("");
  const [headerInputData, setHeaderInputData] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [ExactDataList, setExactDataList] = useState();

  const [addOrEdit, setAddOrEdit] = useState("Add");

  const navigate = useNavigate();

  const isAdmin = localStorage.getItem("isAdmin");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleAddClick = async () => {
    try {
      let imagePath = "";
      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        const uploadResponse = await axios.post(
          "http://localhost:8080/api/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        imagePath = uploadResponse.data.filePath;
      }

      if (addOrEdit === "Add") {
        await axios.post("http://localhost:8080/api/data", {
          text: inputData,
          header: headerInputData,
          image: imagePath,
        });
      } else {
        await axios.patch(`http://localhost:8080/api/data/edit/${addOrEdit}`, {
          text: inputData,
          header: headerInputData,
        });
      }

      setInputData("");
      setSelectedFile(null);
      setAddOrEdit("Add");
      fetchData();
    } catch (error) {
      console.error("Error adding data:", error);
    }
  };

  const fetchExactDataPost = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/getData/${id}`
      );
      setExactDataList(response.data.text);
      setInputData(response.data.text); // Set the text in the textarea
      setHeaderInputData(response.data.header);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleEditClick = (id) => {
    setAddOrEdit(id);
    fetchExactDataPost(id);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/data");
      setDataList(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/home");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/data/${id}`);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const fetchPinnedData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/data/pinned");
      setDataList(response.data);
    } catch (error) {
      console.error("Error fetching pinned data:", error);
    }
  };

  const handlePin = async (id, pinned) => {
    try {
      await axios.patch(`http://localhost:8080/api/data/${id}/pin`, {
        pinned: !pinned,
      });
      fetchPinnedData(); // Refresh the data to update the UI
    } catch (error) {
      console.error("Error pinning data:", error);
    }
  };

  useEffect(() => {
    fetchPinnedData();
    fetchData();
  }, []);

  return (
    <div className={styles.addPost}>
      {isAdmin ? (
        <div className={styles.admin_container}>
          <div>
            <label>სათაური</label>
            <input
              type="text"
              value={headerInputData}
              onChange={(e) => setHeaderInputData(e.target.value)}
              placeholder="Enter some data"
            />
          </div>
            <textarea
              type="text"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              className={styles.textInput}
              placeholder="Enter some data"
            />
            <input type="file" onChange={handleFileChange} />
          <div>
            <button className={styles.add} onClick={handleAddClick}>
              {addOrEdit === "Add" ? "Add" : "Edit"}
            </button>{" "}
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        ""
      )}
      <>
        <ul className={styles.ul}>
          {dataList &&
            dataList.map((data) => {
              return (
                <li className={styles.data} key={data.id}>
                  {data.image && (
                    <img
                      src={`http://localhost:8080/${data.image.split("/")[1]}`}
                      alt="surati"
                      style={{ width: "100px", marginLeft: "10px" }}
                    />
                  )}
                  <div className={styles.textContainer}>
                    <h3>{data.header}</h3>
                    <TextWithMore text={data.text} id={data.id} />
                  </div>

                  {isAdmin ? (
                    <div className={styles.admin_container}>
                      <button onClick={() => handlePin(data.id, data.pinned)}>
                        {data.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button onClick={() => handleDelete(data.id)}>
                        Delete
                      </button>
                      <button onClick={() => handleEditClick(data.id)}>
                        Edit
                      </button>
                    </div>
                  ) : (
                    ""
                  )}
                </li>
              );
            })}
        </ul>
      </>
    </div>
  );
};

export default Home;
