import { api } from "~/trpc/react";
import Todo from "./Todo";

export default function Todos() {
  const { data: todos, isLoading, isError } = api.todo.all.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching todos ❌</div>;

  return (
    <>
      {todos && todos.length > 0
        ? todos.map((todo) => {
            return <Todo key={todo.id} todo={todo} />;
          })
        : "Create your first todo ..."}
    </>
  );
}
