import { createContext } from "react";

type ContextType = {
    onSubmitStep: (email: string, password: string, username: string) => void;
    email: string;
    password: string;
    username: string;
}

const AuthContext = createContext<ContextType>({
    onSubmitStep: () => {},
    email: '',
    password: '',
    username: ''
});

export default AuthContext