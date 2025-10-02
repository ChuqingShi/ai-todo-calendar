import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TodosPage from "@/app/todos/page";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Todos Persistence", () => {
  const STORAGE_KEY = "ai-todo-calendar-todos";

  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should load todos from localStorage on mount", async () => {
    // Arrange: Pre-populate localStorage
    const savedTodos = [
      { id: 1, title: "Test Todo 1", completed: false },
      { id: 2, title: "Test Todo 2", completed: true },
    ];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(savedTodos));

    // Act: Render component
    render(<TodosPage />);

    // Assert: Todos should be loaded
    await waitFor(() => {
      expect(screen.getByText("Test Todo 1")).toBeInTheDocument();
      expect(screen.getByText("Test Todo 2")).toBeInTheDocument();
    });
  });

  it("should save new todos to localStorage", async () => {
    // Arrange: Render component
    render(<TodosPage />);
    const input = screen.getByPlaceholderText("Add a new todo...");
    const addButton = screen.getByText("Add");

    // Act: Add a todo
    fireEvent.change(input, { target: { value: "New Todo" } });
    fireEvent.click(addButton);

    // Assert: Todo should be saved to localStorage
    await waitFor(() => {
      const storedTodos = JSON.parse(
        localStorageMock.getItem(STORAGE_KEY) || "[]"
      );
      expect(storedTodos).toHaveLength(1);
      expect(storedTodos[0].title).toBe("New Todo");
      expect(storedTodos[0].completed).toBe(false);
    });
  });

  it("should persist todo completion status", async () => {
    // Arrange: Render with a todo
    const savedTodos = [{ id: 1, title: "Test Todo", completed: false }];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(savedTodos));
    render(<TodosPage />);

    // Act: Toggle completion
    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);

    // Assert: Completion status should be saved
    await waitFor(() => {
      const storedTodos = JSON.parse(
        localStorageMock.getItem(STORAGE_KEY) || "[]"
      );
      expect(storedTodos[0].completed).toBe(true);
    });
  });

  it("should persist todo deletion", async () => {
    // Arrange: Render with todos
    const savedTodos = [
      { id: 1, title: "Test Todo 1", completed: false },
      { id: 2, title: "Test Todo 2", completed: false },
    ];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(savedTodos));
    render(<TodosPage />);

    // Act: Delete first todo
    const deleteButtons = await screen.findAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    // Assert: Only one todo should remain in localStorage
    await waitFor(() => {
      const storedTodos = JSON.parse(
        localStorageMock.getItem(STORAGE_KEY) || "[]"
      );
      expect(storedTodos).toHaveLength(1);
      expect(storedTodos[0].title).toBe("Test Todo 2");
    });
  });

  it("should handle empty localStorage gracefully", () => {
    // Arrange: Empty localStorage
    localStorageMock.clear();

    // Act: Render component
    render(<TodosPage />);

    // Assert: Should show empty state
    expect(
      screen.getByText("No todos yet. Add one above!")
    ).toBeInTheDocument();
  });

  it("should handle corrupt localStorage data gracefully", () => {
    // Arrange: Set corrupt data
    localStorageMock.setItem(STORAGE_KEY, "corrupt-json-data");

    // Act & Assert: Should not crash
    expect(() => render(<TodosPage />)).not.toThrow();
  });
});
