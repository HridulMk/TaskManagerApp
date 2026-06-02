import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskCard } from "@/components/tasks/TaskCard";
import { Task } from "@/types";

const baseTask: Task = {
  id: 1,
  title: "Fix login bug",
  description: "The login page crashes on submit",
  status: "todo",
  priority: "high",
  due_date: "2025-12-31",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("TaskCard", () => {
  it("renders task title and description", () => {
    render(
      <TaskCard
        task={baseTask}
        selected={false}
        onToggleSelect={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("Fix login bug")).toBeInTheDocument();
    expect(screen.getByText("The login page crashes on submit")).toBeInTheDocument();
  });

  it("renders priority badge", () => {
    render(
      <TaskCard
        task={baseTask}
        selected={false}
        onToggleSelect={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders due date when present", () => {
    render(
      <TaskCard
        task={baseTask}
        selected={false}
        onToggleSelect={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.getByText(/12\/31\/2025|31\/12\/2025|2025/)).toBeInTheDocument();
  });

  it("does not render due date when null", () => {
    render(
      <TaskCard
        task={{ ...baseTask, due_date: null }}
        selected={false}
        onToggleSelect={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(screen.queryByText(/2025/)).not.toBeInTheDocument();
  });

  it("applies ring class when selected", () => {
    const { container } = render(
      <TaskCard
        task={baseTask}
        selected={true}
        onToggleSelect={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    expect(container.firstChild).toHaveClass("ring-2");
  });

  it("calls onToggleSelect when checkbox is clicked", () => {
    const onToggleSelect = jest.fn();
    render(
      <TaskCard
        task={baseTask}
        selected={false}
        onToggleSelect={onToggleSelect}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggleSelect).toHaveBeenCalledWith(1);
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEdit = jest.fn();
    render(
      <TaskCard
        task={baseTask}
        selected={false}
        onToggleSelect={jest.fn()}
        onEdit={onEdit}
        onDelete={jest.fn()}
      />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onEdit).toHaveBeenCalledWith(baseTask);
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDelete = jest.fn();
    render(
      <TaskCard
        task={baseTask}
        selected={false}
        onToggleSelect={jest.fn()}
        onEdit={jest.fn()}
        onDelete={onDelete}
      />
    );
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[1]);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
