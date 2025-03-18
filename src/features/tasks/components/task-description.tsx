import { useState } from "react";
import { PencilIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/dotted-separator";

import { Task } from "../types";
import { useUpdateTask } from "../api/use-update-task";

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Initialize with empty string if task.description is null or undefined
  const [value, setValue] = useState(task.description || "");

  const { mutate: updateTask, isPending: isUpdatingTask } = useUpdateTask();

  const handleSave = () => {
    updateTask({
      json: { description: value },
      param: { taskId: task.$id },
    });
    setIsEditing(false); // Close editing mode after saving
  };

  const handleCancel = () => {
    // Reset to original value when canceling
    setValue(task.description || "");
    setIsEditing(false);
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Overview</p>
        <Button
          onClick={isEditing ? handleCancel : () => setIsEditing(true)}
          size="sm"
          variant="secondary"
        >
          {isEditing ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <PencilIcon className="size-4 mr-2" />
          )}
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Add a description..."
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isUpdatingTask}
          />
          <Button
            className="w-fit ml-auto"
            size="sm"
            onClick={handleSave}
            disabled={isUpdatingTask}
          >
            {isUpdatingTask ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      ) : (
        <div>
          {task.description ? (
            <p>{task.description}</p>
          ) : (
            <span className="text-muted-foreground">No description set</span>
          )}
        </div>
      )}
    </div>
  );
};
