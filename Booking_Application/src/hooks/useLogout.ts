import { useMutation } from "react-query";
import { AuthContext } from "../context/auth/AuthContext";
import { useContext } from "react";
import request from "../services/http";
import { LOGOUT } from "../constants/Urls";
import { AuthActionTypes } from "../context/auth/AuthContextTypes";
import { socket } from "../utils/Socket";


export const useLogout = () => {
    const { dispatch } = useContext(AuthContext);

    return useMutation((body: object) => request(LOGOUT, "post", body), {
        onSuccess: () => {
            dispatch({ type: AuthActionTypes.REMOVE_USER_INFO })
            socket.disconnect()
            localStorage.clear()
        }
    })
}

