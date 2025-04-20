import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const getPostById = async (id: string) => {
  const postRef = doc(db, 'posts', id);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) return null;

  const data = postSnap.data();
  return {
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
  };
};
