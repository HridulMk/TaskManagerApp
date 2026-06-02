import React from "react";
import { render, screen } from "@testing-library/react";
import { TaskBadge } from "@/components/tasks/TaskBadge";

describe("TaskBadge", () => {
  it("renders Todo for todo status", () => {
    render(<TaskBadge status="todo" />);
    expect(screen.getByText("Todo")).toBeInTheDocument();
  });

  it("renders In Progress for in_progress status", () => {
    render(<TaskBadge status="in_progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders Completed for completed status", () => {
    render(<TaskBadge status="completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });
});
