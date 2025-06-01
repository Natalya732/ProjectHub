import React, { useEffect, useRef, useState } from "react";
import styles from "./Account.module.css";
import { Camera, Edit2, Paperclip, GitHub, Linkedin, Trash2, Plus, Save } from "react-feather";
import image from "../../assets/profile.jpg";
import InputControl from "../InputControl/InputControl";
import { Navigate } from "react-router-dom";
import Spinner from "../spinner/Spinner";
import {
  updateUserDatabase,
  uploadImage,
  getAllProjectsForUser,
  deleteProject,
} from "../../firebase";
import ProjectForm from "./ProjectForm/ProjectForm";
import SignOut from "../Auth/Logout/Logout";

export default function Account({ userDetails, auth: isAuthenticated }) {
  const imagePicker = useRef();
  const [progress, setProgress] = useState(0);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileImageUploadStarted, setProfileImageUploadStarted] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(false);
  const [isEditProjectModal, setIsEditProjectModal] = useState(false);
  const [editProject, setEditProject] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDetailsButton, setShowSaveDetailsButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [userprofileValues, setUserProfileValues] = useState({
    name: userDetails?.name || "",
    designation: userDetails?.designation || "",
    github: userDetails?.github || "",
    linkedin: userDetails?.linkedin || "",
  });

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
    console.log({ userprofileValues, profileImageUrl, uid: userDetails })
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

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image (JPEG, PNG, or WebP)');
      return;
    }

    if (file.size > maxSize) {
      setErrorMessage('Image size should be less than 5MB');
      return;
    }

    setProfileImageUploadStarted(true);
    setErrorMessage('');

    uploadImage(
      file,
      (progress) => setProgress(progress),
      (url) => {
        setProfileImageUrl(url);
        setProfileImageUploadStarted(false);
        setProgress(0);
        setShowSaveDetailsButton(true);
      },
      (err) => {
        console.error("Error uploading image:", err);
        setProfileImageUploadStarted(false);
        setErrorMessage("Failed to upload image. Please try again.");
      }
    );
  };

  const fetchAllProjects = async () => {
    try {
      const result = await getAllProjectsForUser(userDetails?.uid);
      if (!result) {
        setProjectsLoaded(true);
        return;
      }

      const tempProjects = result.docs.map(doc => ({
        pid: doc.id,
        ...doc.data()
      }));

      setProjects(tempProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setErrorMessage("Failed to load projects. Please refresh the page.");
    } finally {
      setProjectsLoaded(true);
    }
  };

  const handleEditClick = (project) => {
    setIsEditProjectModal(true);
    setEditProject(project);
    setShowProjectForm(true);
  };

  const handleDelete = async (pid) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(pid);
        fetchAllProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        setErrorMessage("Failed to delete project. Please try again.");
      }
    }
  };

  const handleProjectFormClose = () => {
    setShowProjectForm(false);
    setIsEditProjectModal(false);
    setEditProject({});
  };

  useEffect(() => {
    if (userDetails?.uid) {
      fetchAllProjects();
    }
  }, [userDetails?.uid]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className={styles.container}>
      {showProjectForm && (
        <ProjectForm
          onClose={handleProjectFormClose}
          uid={userDetails?.uid}
          onSubmission={fetchAllProjects}
          isEdit={isEditProjectModal}
          default={editProject}
        />
      )}

      <header className={styles.header}>
        <div>
          <h1 className={styles.heading}>
            Welcome, <span>{userprofileValues?.name || 'User'}</span>
          </h1>
          <p className={styles.subheading}>Manage your profile and projects</p>
        </div>
        <SignOut />
      </header>

      <input
        type="file"
        ref={imagePicker}
        accept="image/jpeg, image/png, image/webp"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />

      <main className={styles.mainContent}>
        <section className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <h2>Profile Information</h2>
            <p>Update your personal details and links</p>
          </div>

          <div className={styles.profileContent}>
            <div className={styles.profileImageContainer}>
              <div className={styles.profileImageWrapper}>
                <img
                  src={
                    profileImageUrl ||
                    userDetails?.profileImageUrl ||
                    image
                  }
                  alt="Profile"
                  className={styles.profileImage}
                />
                <button
                  onClick={handleCameraClick}
                  className={styles.cameraButton}
                  disabled={profileImageUploadStarted}
                  aria-label="Update profile picture"
                >
                  {profileImageUploadStarted ? (
                    <Spinner className={styles.spinner} />
                  ) : (
                    <Camera size={18} />
                  )}
                </button>
              </div>
              {profileImageUploadStarted && (
                <div className={styles.uploadProgress}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${progress}%` }}
                  />
                  <span className={styles.progressText}>
                    {progress === 100 ? 'Processing...' : `${Math.round(progress)}%`}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.profileDetails}>
              <div className={styles.formGrid}>
                <InputControl
                  label="Full Name"
                  value={userprofileValues.name}
                  onChange={(e) => handleInputChange(e, "name")}
                  placeholder="John Doe"
                />
                <InputControl
                  label="Job Title"
                  placeholder="e.g. Senior Developer"
                  value={userprofileValues.designation}
                  onChange={(e) => handleInputChange(e, "designation")}
                />
                <InputControl
                  label="GitHub Profile"
                  placeholder="https://github.com/username"
                  value={userprofileValues.github}
                  onChange={(e) => handleInputChange(e, "github")}
                  icon={<GitHub size={16} />}
                />
                <InputControl
                  label="LinkedIn Profile"
                  placeholder="https://linkedin.com/in/username"
                  value={userprofileValues.linkedin}
                  onChange={(e) => handleInputChange(e, "linkedin")}
                  icon={<Linkedin size={16} />}
                />
              </div>

              {errorMessage && (
                <div className={styles.errorMessage}>
                  {errorMessage}
                </div>
              )}

              {showSaveDetailsButton && (
                <div className={styles.formActions}>
                  <button
                    onClick={saveDetailsToFirestore}
                    className={styles.saveButton}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Spinner className={styles.buttonSpinner} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={styles.projectsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Your Projects</h2>
              <p>Manage your portfolio projects</p>
            </div>
            <button
              onClick={() => setShowProjectForm(true)}
              className={styles.addProjectButton}
            >
              <Plus size={18} />
              <span>Add Project</span>
            </button>
          </div>

          {!projectsLoaded ? (
            <div className={styles.loadingState}>
              <Spinner className={styles.spinner} />
              <p>Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className={styles.emptyState}>
              <Paperclip size={48} className={styles.emptyIcon} />
              <h3>No Projects Yet</h3>
              <p>Get started by adding your first project to showcase your work</p>
              <button
                onClick={() => setShowProjectForm(true)}
                className={styles.ctaButton}
              >
                <Plus size={18} />
                <span>Create Project</span>
              </button>
            </div>
          ) : (
            <div className={styles.projectsGrid}>
              {projects.map((project) => (
                <div key={project.pid} className={styles.projectCard}>
                  <div className={styles.projectInfo}>
                    <h3 className={styles.projectTitle}>
                      {project.title || 'Untitled Project'}
                    </h3>
                    {project.overview && (
                      <p className={styles.projectOverview}>
                        {project.overview.length > 100
                          ? `${project.overview.substring(0, 100)}...`
                          : project.overview}
                      </p>
                    )}
                    {project.technologies?.length > 0 && (
                      <div className={styles.techTags}>
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span key={i} className={styles.techTag}>
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className={styles.moreTag}>
                            +{project.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className={styles.projectActions}>
                    <button
                      onClick={() => handleEditClick(project)}
                      className={styles.actionButton}
                      aria-label="Edit project"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.pid)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      aria-label="Delete project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
