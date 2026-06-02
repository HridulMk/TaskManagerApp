import React from "react";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "@/components/StatsCard";
import { ListTodo } from "lucide-react";

describe("StatsCard", () => {
  it("renders title, count, and description", () => {
    render(
      <StatsCard
        title="Total Tasks"
        count={42}
        icon={ListTodo}
        description="All tasks"
      />
    );
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("All tasks")).toBeInTheDocument();
  });

  it("renders count of 0", () => {
    render(
      <StatsCard
        title="Completed"
        count={0}
        icon={ListTodo}
        description="Done"
      />
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
