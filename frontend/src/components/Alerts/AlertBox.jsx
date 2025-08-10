import React from 'react'
import { AlertCircleIcon } from "lucide-react"
import {
  Alert,
  AlertTitle,
} from "@/components/ui/alert"
const AlertBox = ({message,variant}) => {
  return (
    <Alert variant={variant} className="py-2 text-esm text-darkRed">
      <AlertCircleIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  );
}

export default AlertBox
