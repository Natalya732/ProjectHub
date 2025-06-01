import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { ArrowRight, Code, Layout, Database, Cpu, Plus } from "react-feather";
import designerIcon from "../../assets/designer.jpg";
import image from "../../assets/camera.svg";
import Spinner from "../spinner/Spinner";
import { getAllProjects } from "../../firebase";
import ProjectModal from "./ProjectModal/ProjectModal";
import ProjectForm from "../account/ProjectForm/ProjectForm";
import SignOut from "../Auth/Logout/Logout";

const features = [
  { icon: <Code size={24} />, title: "Web Projects" },
  { icon: <Layout size={24} />, title: "UI/UX Designs" },
  { icon: <Database size={24} />, title: "Database Solutions" },
  { icon: <Cpu size={24} />, title: "AI/ML Projects" },
];

function Home({ auth, userDetails }) {
  const navigate = useNavigate();
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectDetails, setProjectDetails] = useState({});
  const isAuthenticated = !!auth;

  const handleNextButtonClick = () => {
    navigate(isAuthenticated ? "/account" : "/login");
  };

  const fetchAllProjects = async () => {
    const result = await getAllProjects();
    setProjectsLoaded(true);
    if (!result) return;
    const tempProjects = [];
    result.forEach((doc) => tempProjects.push({ ...doc.data(), pid: doc.id }));
    setProjects(tempProjects);
    console.log("result are", result);
    console.log("tempprojects are", tempProjects);
  };

  const handleProjectCardClick = (project) => {
    setProjectDetails(project);
    setShowProjectModal(true);
  };

  useEffect(() => {
    fetchAllProjects();
  }, []);

  return (
    <div className={styles.container}>
      {showProjectModal && (
        <ProjectModal
          onClose={() => setShowProjectModal(false)}
          details={projectDetails}
        />
      )}

      <header className={styles.hero}>
        {isAuthenticated && <div className={styles.signOutContainer}>
          <SignOut />
        </div>}
        <div className={styles.heroContent}>
          <h1>Showcase Your Development Projects</h1>
          <p className={styles.subtitle}>
            Discover, share, and collaborate on innovative software projects with developers worldwide
          </p>
          <div className={styles.ctaContainer}>
            <button
              className={styles.primaryButton}
              onClick={handleNextButtonClick}
            >
              {isAuthenticated ? "Manage Projects" : "Get Started"}
              <ArrowRight size={18} className={styles.buttonIcon} />
            </button>
            {isAuthenticated && (
              <button
                className={styles.secondaryButton}
                onClick={() => setShowProjectForm(true)}
              >
                <Plus size={18} className={styles.buttonIcon} />
                New Project
              </button>
            )}
          </div>
          {showProjectForm && (
            <ProjectForm
              onClose={() => setShowProjectForm(false)}
              uid={userDetails?.uid}
              onSubmission={fetchAllProjects()}
              isEdit={false}
              default={null}
            />
          )}
          <div className={styles.features}>
            {features.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <span className={styles.featureIcon}>{feature.icon}</span>
                <span>{feature.title}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src={designerIcon} alt="Code collaboration" />
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <h2>Featured Projects</h2>
          <p>Explore projects created by our community</p>
        </div>

        {projectsLoaded ? (
          <div className={styles.projectsGrid}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <article
                  key={project.pid}
                  className={styles.projectCard}
                  onClick={() => handleProjectCardClick(project)}
                >
                  <div className={styles.projectImage}>
                    <img
                      src={project.thumbnail || image}
                      alt={project.title}
                      loading="lazy"
                    />
                    <div className={styles.overlay}>
                      <button className={styles.viewButton}>View Project</button>
                    </div>
                  </div>
                  <div className={styles.projectInfo}>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    {project.technologies && (
                      <div className={styles.techTags}>
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span key={i} className={styles.techTag}>{tech}</span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className={styles.moreTag}>+{project.technologies.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className={styles.emptyState}>
                <h3>No projects found</h3>
                <p>Be the first to share your project!</p>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.loadingState}>
            <Spinner />
            <p>Loading projects...</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
