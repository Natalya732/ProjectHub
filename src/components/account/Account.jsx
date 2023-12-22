import React, { useEffect, useRef, useState } from "react";
import styles from "./Account.module.css";
import { Camera, Edit2, GitHub, LogOut, Paperclip, Trash } from "react-feather";
import image from "../../assets/profile.jpg";
import InputControl from "../InputControl/InputControl";
import { Link, Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  auth,
  updateUserDatabase,
  uploadImage,
  getAllProjectsForUser,
  deleteProject,
} from "../../firebase";
import ProjectForm from "./ProjectForm/ProjectForm";

export default function Account(props) {
  const userDetails = props.userDetails;
  const isAuthenticated = props.auth;
  const imagePicker = useRef();
  const [progress, setProgress] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageUploadStarted, setProfileImageUploadStarted] =
    useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState([]);

  const [userprofileValues, setUserProfileValues] = useState({
    name: userDetails?.name,
    designation: userDetails?.designation || "",
    github: userDetails?.github || "",
    linkedin: userDetails?.linkedin || "",
  });
  const [showSaveDetailsButton, setShowSaveDetailsButton] = useState(false);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditProjectModal, setIsEditProjectModal] = useState(false);
  const [editProject, setEditProject] = useState({});
  const handleLogOut = async () => {
    await signOut(auth);
  };
  const handleCameraClick = () => {
    imagePicker.current.click();
  };
  const handleInputChange = (event, property) => {
    setShowSaveDetailsButton(true);
    setUserProfileValues((prev) => ({
      ...prev,
      [property]: event.target.value,
    }));
  };
  const saveDetailsToFirestore = async () => {
    if (!userprofileValues.name) {
      setErrorMessage("Name required");
      return;
    }

    setSaveButtonDisabled(true);
    await updateUserDatabase(
      { ...userprofileValues, profileImageUrl },
      userDetails?.uid
    );
    setSaveButtonDisabled(false);
    setShowSaveDetailsButton(false);
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setProfileImageUploadStarted(true);
    uploadImage(
      file,
      (progress) => setProgress(progress),

      (url) => {
        setProfileImageUrl(url);
        setProfileImageUploadStarted(false);
        setProgress(0);
      },
      (err) => {
        console.error("error is", err);
        setProfileImageUploadStarted(false);
      }
    );
  };

  const fetchAllProjects = async () => {
    const result = await getAllProjectsForUser(userDetails?.uid);
    if (!result) {
      setProjectsLoaded(true);
      return;
    }
    setProjectsLoaded(true);
    let tempProjects = [];
    result.forEach((doc) => tempProjects.push({ ...doc.data(), pid: doc.id }));
    setProjects(tempProjects);
  };

  const handleEditClick = (project) => {
    setIsEditProjectModal(true);
    setEditProject(project);
    setShowProjectForm(true);
  };

  const handleDelete = async (pid) => {
    await deleteProject(pid);
    fetchAllProjects();
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  return isAuthenticated ? (
    <div className={styles.container}>
      {showProjectForm && (
        <ProjectForm
          onClose={() => setShowProjectForm(false)}
          uid={userDetails?.uid}
          onSubmission={fetchAllProjects()}
          isEdit={isEditProjectModal}
          default={editProject}
        />
      )}
      <div className={styles.header}>
        <p className={styles.heading}>
          Welcome <span>{userprofileValues?.name}</span>
        </p>

        <div className={styles.logout} onClick={() => handleLogOut()}>
          <LogOut /> LogOut
        </div>
      </div>
      <input
        type="file"
        ref={imagePicker}
        style={{ display: "none" }}
        onChange={(e) => handleImageChange(e)}
      />
      <div className={styles.section}>
        <div className={styles.title}>Your Profile</div>
        <div className={styles.profile}>
          <div className={styles.left}>
            <div className={styles.image}>
              <img
                src={
                  profileImageUrl
                    ? profileImageUrl
                    : userDetails?.profileImageUrl
                }
                alt="Profile Image"
              />
              <div
                className={styles.camera}
                onClick={() => handleCameraClick()}
              >
                <Camera />
              </div>
            </div>
            {profileImageUploadStarted ? (
              <p className={styles.progress}>
                {progress === 100
                  ? "Getting image url ... "
                  : `${progress.toFixed(2)}% uploaded`}
              </p>
            ) : (
              ""
            )}
          </div>
          <div className={styles.right}>
            <div className={styles.row}>
              <InputControl
                label="Name"
                value={userprofileValues.name}
                onChange={(e) => handleInputChange(e, "name")}
              />
              <InputControl
                label="Title"
                placeholder="eg. Full Stack Developer"
                value={userprofileValues.designation}
                onChange={(e) => handleInputChange(e, "designation")}
              />
            </div>
            <div className={styles.row}>
              <InputControl
                label="Github"
                placeholder="Enter your Github Link"
                value={userprofileValues.github}
                onChange={(e) => handleInputChange(e, "github")}
              />
              <InputControl
                label="LinkedIn"
                placeholder="Enter your LinkedIn Link"
                value={userprofileValues.linkedin}
                onChange={(e) => handleInputChange(e, "linkedin")}
              />
            </div>
            <div className={styles.footer}>
              <p className={styles.error}>{errorMessage}</p>
              {showSaveDetailsButton && (
                <div
                  className="button"
                  disabled={saveButtonDisabled}
                  onClick={() => saveDetailsToFirestore()}
                >
                  Save Details
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className={styles.section}>
        <div className={styles.projectsHeader}>
          <div className={styles.title}>Your Projects</div>
          <button
            className="button"
            onClick={() => {
              setShowProjectForm(true);
              setIsEditProjectModal(false);
              setEditProject({});
            }}
          >
            Add Project
          </button>
        </div>

        <div className={styles.projects}>
          {projectsLoaded ? (
            projects.length > 0 ? (
              projects.map((item, index) => (
                <div className={styles.project} key={index}>
                  <p className={styles.title}>{item.title}</p>
                  <div className={styles.links}>
                    <Edit2 onClick={() => handleEditClick(item)} />
                    <Trash onClick={() => handleDelete(item.pid)} />
                    <Link target="_blank" to={`//${item.github}`}>
                      <GitHub />
                    </Link>
                    {item.link ? (
                      <Link target="_blank" to={`//${item.link}`}>
                        <Paperclip />
                      </Link>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ))
            ) : (
              <h3>No Projects Found</h3>
            )
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  ) : (
    <Navigate to="/" />
  );
}
