"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface ExploreUser {
  id: string;
  username: string;
  profilePictureUrl?: string;
  bio?: string;
}

interface FriendsContextType {
  friends: ExploreUser[];
  setFriends: (users: ExploreUser[]) => void;
  addFriend: (user: ExploreUser) => void;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const [friends, setFriends] = useState<ExploreUser[]>([]);

  //  Load dari localStorage hanya di client
  useEffect(() => {
    const saved = localStorage.getItem("friends");
    if (saved) setFriends(JSON.parse(saved));
  }, []);

  //  Simpan ke localStorage setiap ada perubahan friends
  useEffect(() => {
    localStorage.setItem("friends", JSON.stringify(friends));
  }, [friends]);

  const addFriend = (user: ExploreUser) => {
    setFriends((prev) => {
      // hindari duplikat
      if (prev.find((u) => u.id === user.id)) return prev;
      return [...prev, user];
    });
  };

  return (
    <FriendsContext.Provider value={{ friends, setFriends, addFriend }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context)
    throw new Error("useFriends must be used within FriendsProvider");
  return context;
};
