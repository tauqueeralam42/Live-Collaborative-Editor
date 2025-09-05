import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CodeConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  code: string;
}

const CodeConfirmationDialog: React.FC<CodeConfirmationDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  code,
}) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add Code to Panel?</AlertDialogTitle>
          <AlertDialogDescription>
            Would you like to add this code to the coding panel?
            <pre className="mt-4 p-4 bg-muted rounded-lg overflow-auto max-h-[200px]">
              <code>{code}</code>
            </pre>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>No, Thanks</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Add Code</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CodeConfirmationDialog;
