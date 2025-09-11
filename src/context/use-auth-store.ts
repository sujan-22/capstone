import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ISession, IUser } from "../../auth-client";

interface IAuthStore {
    currentUser: IUser | null;
    setCurrentUser: (data: IUser) => void;
    session: ISession | null;
    setSession: (data: ISession) => void;
    logoutUser: () => void;
    email: string | null;
    setEmail: (email: string) => void;
    clearEmail: () => void;
}

const useAuthStore = create<IAuthStore>()(
    persist(
        (set) => ({
            currentUser: null,
            session: null,
            email: null,
            authOtpHandlerType: null,

            setSession: (data) => set({ session: data }),
            setCurrentUser: (data) => set({ currentUser: data }),
            logoutUser: () => {
                set({
                    currentUser: null,
                });
            },
            setEmail: (email: string) => set({ email }),
            clearEmail: () => set({ email: null }),
        }),
        {
            name: "user-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                email: state.email,
            }),
        }
    )
);

export default useAuthStore;
