import { useState, useEffect } from "react";
import {
  collection, query, orderBy, onSnapshot, limit,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  increment, arrayRemove, arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addPost = async (post) => {
    await addDoc(collection(db, "posts"), {
      ...post, likes: 0, comments: 0, likedBy: [], createdAt: serverTimestamp(),
    });
  };

  const toggleLike = async (postId, userId, currentlyLiked) => {
    const ref = doc(db, "posts", postId);
    await updateDoc(ref, {
      likes: increment(currentlyLiked ? -1 : 1),
      likedBy: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
    });
  };

  const deletePost = async (postId) => deleteDoc(doc(db, "posts", postId));

  return { posts, loading, addPost, toggleLike, deletePost };
}

export function useOils() {
  const [oils, setOils] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "oils"), (snap) => {
      setOils(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addOil = async (oil) => addDoc(collection(db, "oils"), { ...oil, createdAt: serverTimestamp() });
  const removeOil = async (id) => deleteDoc(doc(db, "oils", id));
  const updateOil = async (id, data) => updateDoc(doc(db, "oils", id), data);

  return { oils, loading, addOil, removeOil, updateOil };
}

export function useTags() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tags"), (snap) => {
      setTags(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const addTag = async (tag) => addDoc(collection(db, "tags"), tag);
  const removeTag = async (id) => deleteDoc(doc(db, "tags", id));

  return { tags, addTag, removeTag };
}

export function useCards() {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cards"), (snap) => {
      setCards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const addCard = async (card) => addDoc(collection(db, "cards"), { ...card, status: "active" });
  const toggleCard = async (id, current) => updateDoc(doc(db, "cards", id), { status: current === "active" ? "inactive" : "active" });
  const removeCard = async (id) => deleteDoc(doc(db, "cards", id));

  return { cards, addCard, toggleCard, removeCard };
}
