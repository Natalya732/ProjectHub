import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { ArrowRight } from "react-feather";
import designerIcon from "../../assets/designer.jpg";
import image from "../../assets/camera.svg";
import Spinner from "../spinner/Spinner";
import { getAllProjects, getAllProjectsForUser } from "../../firebase";
import ProjectModal from "./ProjectModal/ProjectModal";
function Home(props) {
  const navigate = useNavigate();
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showProjectModal, setShowProjectModal] =useState(false);
  const [projectDetails, setProjectDetails ] = useState({});
  const isAuthenticated = props.auth ? true : false;
  const handleNextButtonClick = () => {
    if (isAuthenticated) navigate("/account");
    else navigate("/login");
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
    setShowProjectModal(true);
    setProjectDetails(project);
}

  useEffect(() => {
    fetchAllProjects();
  }, []);
  return (
    <div className={styles.container}>
        {showProjectModal && <ProjectModal onClose ={()=> setShowProjectModal(false)} details={projectDetails}/>}
      <div className={styles.header}>
        <div className={styles.left}>
          <p className={styles.heading}>Projects Fair</p>
          <p className={styles.subHeading}>
            One Stop Destination for all software development projects
          </p>
          <button onClick={() => handleNextButtonClick()}>
            {isAuthenticated ? "Manage Your Projects" : "Get Started"}{" "}
            <ArrowRight />
          </button>
        </div>
        <div className={styles.right}>
          <img src={designerIcon} alt="Projects" />
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.title}>All Projects</div>
        <div className={styles.projects}>
          {projectsLoaded ? (
            projects.length > 0 ? (
              projects.map((item) => (
                <div className={styles.project} key={item.pid} onClick={()=> handleProjectCardClick(item)}>
                  <div className={styles.image}>
                    <img src={item.thumbnail || image} alt="Project image" />
                  </div>
                  <div className={styles.title}>{item.title}</div>
                </div>
              ))
            ) : (
              ""
            )
          ) : (
            <Spinner />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
