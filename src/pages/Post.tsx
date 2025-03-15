import { useState, useEffect } from "react";
import {
  fetchData,
  createData,
  updateData,
  deleteData,
} from "../services/apiService";

interface Post {
  id: number;
  title: string;
  body: string;
}

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchData<{ posts: Post[] }>("posts")
      .then((data) => setPosts(data.posts))
      .catch(() => setError("Gagal mengambil data post."))
      .finally(() => setIsLoading(false));
  }, []);

  const addPost = async () => {
    setIsLoading(true);
    setError("");
    try {
      const randomId = Math.floor(Math.random() * 30) + 1;
      const dummyPost = await fetchData<Post>(`posts/${randomId}`);
      const localId = new Date().getTime(); // ID lokal unik untuk frontend
      const newPost = {
        id: localId,
        title: dummyPost.title,
        body: dummyPost.body,
      };

      setPosts((prev) => [newPost, ...prev]);

      const postFromAPI = await createData<Post>("posts/add", {
        title: dummyPost.title,
        body: dummyPost.body,
        userId: 1,
      });

      setPosts((prev) =>
        prev.map((post) =>
          post.id === localId ? { ...post, id: postFromAPI.id } : post
        )
      );
    } catch (error) {
      console.error("Gagal menambahkan post ke API:", error);
      setError("Gagal menambahkan post.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (id: number, title: string, body: string) => {
    if (id > 30) {
      alert(
        "Data ini hanya tersimpan di frontend dan tidak bisa diupdate di API."
      );
      return;
    }

    const updatedTitle = prompt("Edit title:", title);
    const updatedBody = prompt("Edit body:", body);
    if (!updatedTitle || !updatedBody) return;

    setIsLoading(true);
    try {
      const updatedPost = await updateData<Post>("posts", id, {
        title: updatedTitle,
        body: updatedBody,
      });
      setPosts((prev) =>
        prev.map((post) => (post.id === id ? updatedPost : post))
      );
    } catch (error) {
      console.error("Gagal mengupdate post:", error);
      setError("Gagal mengupdate post.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const removePost = async (id: number) => {
    if (id > 30) {
      setPosts((prev) => prev.filter((post) => post.id !== id));
      return;
    }

    setIsLoading(true);
    try {
      await deleteData("posts", id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Gagal menghapus post:", error);
      setError("Gagal menghapus post.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-center mb-4">Posts</h2>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p className="text-blue-500">Loading...</p>}
      <div className="mb-4">
        <button
          onClick={addPost}
          className="w-full bg-blue-500 text-white py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Post"}
        </button>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-col bg-white p-3 rounded shadow"
          >
            <h3 className="font-bold text-lg">{post.title}</h3>
            <p className="text-gray-700">{post.body}</p>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => updatePost(post.id, post.title, post.body)}
                className="text-yellow-500"
              >
                ✎
              </button>
              <button
                onClick={() => removePost(post.id)}
                className="text-red-500"
              >
                ✖
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;
