import { signOut } from "firebase/auth";
import { LogOut } from "react-feather";
import styles from "./Logout.module.css";
import { auth } from "../../../firebase";

export default function SignOut() {
    const handleLogOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            setErrorMessage("Failed to sign out. Please try again.");
        }
    };

    return (
        <>
            <button onClick={handleLogOut} className={styles.signOutButton}>
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </>
    )
} 