import { ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
}

/**
 * Every module in this ERP (masters and transactions alike) creates/edits
 * records inside this same modal "window" rather than navigating to a
 * separate page. The list page underneath stays mounted, so closing the
 * modal (Cancel, Esc, backdrop click) returns exactly where the user left off.
 */
export function FormModal({
  open,
  title,
  subtitle,
  onClose,
  onSubmit,
  submitLabel = "Save",
  isSubmitting = false,
  maxWidth = "md",
  children,
}: FormModalProps) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === "backdropClick" && isSubmitting) return;
        onClose();
      }}
      fullWidth
      maxWidth={maxWidth}
      keepMounted={false}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pr: 1 }}>
        <Stack spacing={0.25}>
          <span>{title}</span>
          {subtitle && (
            <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(0,0,0,0.6)" }}>{subtitle}</span>
          )}
        </Stack>
        <IconButton onClick={onClose} size="small" disabled={isSubmitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>{children}</DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
