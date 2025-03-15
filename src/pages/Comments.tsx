import { useState, useEffect } from "react";
import {
  fetchData,
  createData,
  updateData,
  deleteData,
} from "../services/apiService";

interface Comment {
  id: number;
  body: string;
  postId: number;
}

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    fetchData<{ comments: Comment[] }>("comments")
      .then((data) => setComments(data.comments))
      .catch(() => setError("Gagal mengambil data comments."))
      .finally(() => setIsLoading(false));
  }, []);

  const addComment = async () => {
    setIsLoading(true);
    setError("");
    try {
      const randomId = Math.floor(Math.random() * 30) + 1;
      const dummyComment = await fetchData<Comment>(`comments/${randomId}`);

      const localId = new Date().getTime(); // ID unik lokal
      const newComment = { id: localId, body: dummyComment.body, postId: 1 };

      // Tambahkan ke state dengan ID lokal dulu
      setComments((prev) => [newComment, ...prev]);

      // Simpan ke API
      const commentFromAPI = await createData<Comment>("comments/add", {
        body: dummyComment.body,
        postId: 1,
        userId: 1,
      });

      // Perbarui ID jika sukses dari API
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === localId
            ? { ...comment, id: commentFromAPI.id }
            : comment
        )
      );
    } catch (error) {
      console.error("Gagal menambahkan comment ke API:", error);
      setError("Gagal menambahkan comment.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async (id: number, body: string) => {
    if (id > 30) {
      alert(
        "Data ini hanya tersimpan di frontend dan tidak bisa diupdate di API."
      );
      return;
    }

    const updatedBody = prompt("Edit comment:", body);
    if (!updatedBody) return;

    setIsLoading(true);
    try {
      const updatedComment = await updateData<Comment>("comments", id, {
        body: updatedBody,
      });
      setComments((prev) =>
        prev.map((comment) => (comment.id === id ? updatedComment : comment))
      );
    } catch (error) {
      console.error("Gagal mengupdate comment:", error);
      setError("Gagal mengupdate comment.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const removeComment = async (id: number) => {
    if (id > 30) {
      setComments((prev) => prev.filter((comment) => comment.id !== id));
      return;
    }

    setIsLoading(true);
    try {
      await deleteData("comments", id);
      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (error) {
      console.error("Gagal menghapus comment:", error);
      setError("Gagal menghapus comment.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold text-center mb-4">Comments</h2>
      {error && <p className="text-red-500">{error}</p>}
      {isLoading && <p className="text-blue-500">Loading...</p>}
      <div className="mb-4">
        <button
          onClick={addComment}
          className="w-full bg-blue-500 text-white py-2 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Adding..." : "Add Comment"}
        </button>
      </div>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex flex-col bg-white p-3 rounded shadow"
          >
            <p className="text-gray-700">{comment.body}</p>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => updateComment(comment.id, comment.body)}
                className="text-yellow-500"
              >
                ✎
              </button>
              <button
                onClick={() => removeComment(comment.id)}
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

export default Comments;
