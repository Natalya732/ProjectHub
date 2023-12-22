import React, { useEffect, useState } from "react";
import styles from "./Auth.module.css";
import InputControl from "../InputControl/InputControl";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, updateUserDatabase } from "../../firebase";

function Auth(props) {
  const navigate = useNavigate();
  const isSignup = props.signup ? true : false;
  const data = {
    name: "",
    email: "",
    password: "",
  };
  const [values, setValues] = useState(data);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);

  const handleSignUp = () => {
    if (!values.name || !values.email || !values.password) {
      setErrorMsg("All fields required!");
      return;
    }
    setSubmitButtonDisabled(true);
    createUserWithEmailAndPassword(auth, values.email, values.password)
      .then(async (response) => {
        const userId = response.user.uid;
        await updateUserDatabase(
          { name: values.name, email: values.email },
          userId
        );
        console.log("response", response);
        setSubmitButtonDisabled(false);
        navigate("/");
      })

      .catch((err) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(err.message);
      });
  };
  const handleLogin = () => {
    if (!values.email || !values.password) {
      setErrorMsg("All fields required!");
      return;
    }
    setSubmitButtonDisabled(true);
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then(async (response) => {
        console.log("response", response);
        setSubmitButtonDisabled(false);
        navigate("/");
      })
      .catch((err) => {
        setSubmitButtonDisabled(false);
        setErrorMsg(err.message);
      });
  };

  const handleSubmission = (e) => {
    e.preventDefault();
    // so that we can prevent refresh, otherwise by default as soon as the form submitted or this function is called, the page would be refreshed
    if (isSignup) handleSignUp();
    else handleLogin();
  };

  useEffect(() => {
    setValues(data);
    setErrorMsg("");
  }, [isSignup]);


  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmission}>
        <Link to="/" className={styles.smallLink}>
          <a>{"< Back to Home"}</a>
        </Link>
        <p className={styles.heading}>{isSignup ? "Signup" : "Login"}</p>
        {isSignup && (
          <InputControl
            label="Name"
            placeholder="Enter your name"
            value={values.name}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        )}

        <InputControl
          label="Email"
          placeholder="Enter your email"
          value={values.email}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, email: e.target.value }))
          }
        />
        <InputControl
          label="Password"
          isPassword
          value={values.password}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, password: e.target.value }))
          }
        />
        <p className={styles.error}>{errorMsg}</p>
        <button type="submit" disabled={submitButtonDisabled}>
          {isSignup ? "SignUp" : "Login"}
        </button>
        <div className={styles.bottom}>
          {isSignup ? (
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          ) : (
            <p>
              New ? <Link to="/signup"> Create an account </Link>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Auth;
