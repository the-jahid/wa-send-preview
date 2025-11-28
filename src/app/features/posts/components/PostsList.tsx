"use client";

import { useQuery } from "@tanstack/react-query";
import { postQueries } from "../api/posts.query";


export default function PostsList() {
  const { data, isLoading, error } = useQuery(postQueries.list({ limit: 10 }));

  if (isLoading) return <p>Loading posts…</p>;
  if (error) return <p>Failed to load posts.</p>;

  return (
    <ul className="space-y-3">
      {data!.map((p) => (
        <li key={p.id} className="rounded border p-3">
          <h3 className="font-semibold">{p.title}</h3>
          <p className="text-sm opacity-80">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}
