import type { Todo } from "~/types";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";

type TodoProps = {
  todo: Todo;
};

export default function Todo({ todo }: TodoProps) {
  const { id, text, done } = todo;

  const trpc = api.useContext();

  const { mutate: doneMutation } = api.todo.toggle.useMutation({
    onMutate: async ({id, done}) => {
      await trpc.todo.all.cancel();

      const previousTodos = trpc.todo.all.getData();

      trpc.todo.all.setData(undefined, (prev) => {
        if (!prev) {
          return previousTodos;
        }
        return prev.map((todo) => {
          if (todo.id === id) {
            return { ...todo, done };
          }
          return todo;
        });
      });
      return { previousTodos };
    },
    onSuccess: (err, {done}) => {
      if (done) {
        toast.success("Todo completed 🎉");
      }
    },
    onError: (error, newTodo, context) => {
      toast.error("An error occurred");
      trpc.todo.all.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.todo.delete.useMutation({
    onMutate: async (deleteId) => {
      await trpc.todo.all.cancel();

      const previousTodos = trpc.todo.all.getData();

      trpc.todo.all.setData(undefined, (prev) => {
        if (!prev) {
          return previousTodos;
        }
        return prev.filter((todo) => todo.id !== deleteId);
      });
      return { previousTodos };
    },
    onError: (error, newTodo, context) => {
      toast.error("An error occurred when creating todo");
      trpc.todo.all.setData(undefined, () => context?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            className="focus:ring-3 h-4 w-4 cursor-pointer rounded border border-gray-300 bg-gray-50 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
            type="checkbox"
            name="done"
            id={id}
            checked={done}
            onChange={(e) => {
              doneMutation({ id, done: e.target.checked });
            }}
          />
          <label htmlFor={id} className={`cursor-pointer ${done? 'line-through': ''}`}>
            {text}
          </label>
        </div>
        <button
          className="cursor-pointer rounded-md bg-blue-700 px-2 py-1 text-white hover:bg-blue-800 focus:outline-none focus:ring-4"
          onClick={() => {
            deleteMutation(id);
          }}
        >
          Delete
        </button>
      </div>
    </>
  );
}
