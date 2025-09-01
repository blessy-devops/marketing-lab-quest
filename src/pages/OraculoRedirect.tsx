import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function OraculoRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const newConversationId = uuidv4();
    navigate(`/oraculo/${newConversationId}`, { replace: true });
  }, [navigate]);

  return null;
}