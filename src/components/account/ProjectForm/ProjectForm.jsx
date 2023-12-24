import React, { useRef, useState } from "react";
import Modal from "../../modal/Modal";
import styles from "./ProjectForm.module.css";
import image from "../../../assets/designer.jpg";
import InputControl from "../../InputControl/InputControl";
import { addProjectInDatabase, updateProjectInDatabase, uploadImage } from "../../../firebase";
import {  X } from "react-feather";

function ProjectForm(props) {
  const fileInputRef = useRef();
  const isEdit = props.isEdit ? true : false;
  const defaults = props.default;
  const [values, setValues] = useState({
    thumbnail: defaults.thumbnail || "",
    title: defaults.title || "",
    overview: defaults.overview || "",
    github: defaults.github || "",
    link: defaults.link || "",
    points: defaults.points || ["", ""],
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [imageUploadStarted, setImageUploadStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handlePointUpdate = (value, index) => {
    const tempPoints = [...values.points];
    tempPoints[index] = value;
    setValues((prev) => ({ ...prev, points: tempPoints }));
  };

  const handleAddPoint = () => {
    if (values.points.length > 4) return;
    setValues((prev) => ({ ...prev, points: [...values.points, ""] }));
  };

  const handlePointDelete = (index) => {
    const tempPoints = [...values.points];
    tempPoints.splice(index, 1);
    setValues((prev) => ({ ...prev, points: tempPoints }));
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImageUploadStarted(true);
    uploadImage(
      file,
      (progress) => {
        setProgress(progress);
      },
      (url) => {
        setImageUploadStarted(false);
        setProgress(0);
        setValues((prev) => ({ ...prev, thumbnail: url }));
      },
      (error) => {
        setErrorMsg(error);
        setImageUploadStarted(false);
      }
    );
  };

  const validateForm = () => {
    const actualPoints = values.points.filter((item) => item.trim());

    let isValid = true;

    if (!values.thumbnail) {
      isValid = false;
      setErrorMessage("Thumbnail for project is required");
    } else if (!values.github) {
      isValid = false;
      setErrorMessage("Project's repository link required");
    } else if (!values.title) {
      isValid = false;
      setErrorMessage("Project's Title required");
    } else if (!values.overview) {
      isValid = false;
      setErrorMessage("Project's Overview required");
    } else if (!actualPoints.length) {
      isValid = false;
      setErrorMessage("Description of Project is required");
    } else if (actualPoints.length < 2) {
      isValid = false;
      setErrorMessage("Minimum 2 description points required");
    } else {
      setErrorMessage("");
    }

    return isValid;
  };

  const handleSubmission = async () => {
    if (!validateForm()) return;
    setSubmitButtonDisabled(true);
    if (isEdit) 
    await updateProjectInDatabase({...values, refUser : props.uid},  defaults.pid);
    else await addProjectInDatabase({ ...values, refUser: props.uid });
    setSubmitButtonDisabled(false);
    if (props.onSubmission) props.onSubmission;
    if (props.onClose) props.onClose();
  };

  return (
    <Modal
      onClose={() => {
        props.onClose ? props.onClose() : "";
      }}
    >
      <div className={styles.container}>
        <input
          type="file"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={(event) => handleFileInputChange(event)}
        />
        <div className={styles.inner}>
          <div className={styles.left}>
            <div className={styles.image}>
              <img
                src={values.thumbnail || image}
                alt="Thumbnail"
                onClick={() => fileInputRef.current.click()}
              />
              {imageUploadStarted && (
                <p>
                  <span>{progress.toFixed(2)}%</span>Uploaded
                </p>
              )}
            </div>

            <InputControl
              label="Github"
              value={values.github}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, github: e.target.value }))
              }
              placeholder="Project Repository Link"
            />
            <InputControl
              label="Deployed Link"
              value={values.link}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, link: e.target.value }))
              }
              placeholder="Project Deployed Link"
            />
          </div>

          <div className={styles.right}>
            <InputControl
              label="Project Title"
              value={values.title}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Project Title"
            />
            <InputControl
              label="Project Overview"
              value={values.overview}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, overview: e.target.value }))
              }
              placeholder="Project Overview"
            />

            <div className={styles.description}>
              <div className={styles.top}>
                <p className={styles.title}>Project Description</p>
                <p className={styles.link} onClick={() => handleAddPoint()}>
                  + Add point
                </p>
              </div>

              <div className={styles.inputs}>
                {values.points.map((item, index) => (
                  <div className={styles.input}>
                    <InputControl
                      key={index}
                      value={item}
                      placeholder="Type Something ..."
                      onChange={(e) => handlePointUpdate(e.target.value, index)}
                    />
                    {index > 1 && (
                      <X onClick={() => handlePointDelete(index)} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className={styles.error}>{errorMessage}</p>
        <div className={styles.footer}>
          <p
            className={styles.cancel}
            onClick={() => {
              props.onClose ? props.onClose() : "";
            }}
          >
            Cancel
          </p>
          <button
            className="button"
            onClick={() => handleSubmission()}
            disabled={submitButtonDisabled}
          >
            Submit
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ProjectForm;
