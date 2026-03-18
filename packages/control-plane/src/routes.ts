import { Router } from "express";

/**
 * Factory function that returns an Express Router with control plane API
 * endpoints. All handlers currently return 501 (Not Implemented) and will
 * be wired to the database layer in a later task.
 */
export function controlPlaneRoutes(): Router {
  const router = Router();

  // Customer CRUD
  router.post("/control-plane/customers", (_req, res) => {
    res.status(501).json({ error: "Not yet implemented" });
  });

  router.get("/control-plane/customers", (_req, res) => {
    res.status(501).json({ error: "Not yet implemented" });
  });

  router.get("/control-plane/customers/:id", (_req, res) => {
    res.status(501).json({ error: "Not yet implemented" });
  });

  // Provisioning
  router.post("/control-plane/customers/:id/provision", (_req, res) => {
    res.status(501).json({ error: "Not yet implemented" });
  });

  // Cells
  router.get("/control-plane/cells", (_req, res) => {
    res.status(501).json({ error: "Not yet implemented" });
  });

  // Deprovisioning
  router.delete("/control-plane/customers/:id", (_req, res) => {
    res.status(501).json({ error: "Not yet implemented" });
  });

  return router;
}
