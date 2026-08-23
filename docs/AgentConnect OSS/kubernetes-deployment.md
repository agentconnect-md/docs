---
title: ☸️ Kubernetes deployment
excerpt: Deploy AgentConnect OSS with the official Helm chart and run agents in isolated Kubernetes sandboxes.
hidden: false
---

The official AgentConnect Helm chart is the production-shaped OSS deployment. It installs the Web console, Control Plane, Setup Server, Relay, connector gateway, and an install-wide daemon pool. Agent runtimes run in isolated `agent-sandbox` pods with persistent workspaces instead of on an operator's machine.

For a local evaluation, use the [Docker Compose quickstart](/docs/oss-get-started). Use this guide when the cluster should own agent execution and workspaces.

The chart is published as an OCI artifact at `oci://ghcr.io/agentconnect-md/charts/agentconnect`. Its version matches the AgentConnect release without the leading `v`, and its default image tags match that release.

## Before you start

You need:

- Kubernetes 1.28 or newer;
- Helm and `kubectl` access to the cluster;
- `linux/amd64` worker nodes for the current first-party images;
- a PostgreSQL database reachable from the AgentConnect namespace;
- a dynamic volume provisioner and a StorageClass for agent workspaces;
- permission to install CRDs, cluster-scoped RBAC, and the `agent-sandbox` controller; and
- for public access, a Gateway API controller, an existing Gateway, DNS, and TLS.

The chart creates `HTTPRoute` resources but does not install a Gateway API controller, create the Gateway, or manage DNS and certificates. You can set `route.enabled: false` and provide your own ingress instead.

Choose an AgentConnect release that includes the chart (`v1.44.0-rc.58` or newer) from [AgentConnect releases](https://github.com/agentconnect-md/agentconnect/releases), then verify the artifact. Do not include the release tag's leading `v`:

```bash
export AGENTCONNECT_CHART_VERSION=X.Y.Z

helm show chart oci://ghcr.io/agentconnect-md/charts/agentconnect \
  --version "$AGENTCONNECT_CHART_VERSION"
```

Every supported value is documented in the chart's [values.yaml](https://github.com/agentconnect-md/agentconnect/blob/main/charts/agentconnect/values.yaml).

## 1. Create the namespace and secrets

Create the release namespace:

```bash
kubectl create namespace agentconnect
```

The Control Plane needs a PostgreSQL URL, a stable API-key pepper, and a shared Relay credential:

```bash
kubectl -n agentconnect create secret generic agentconnect-secrets \
  --from-literal=DATABASE_URL='postgresql://control_plane:replace-me@postgres.example.test:5432/agentconnect?schema=public' \
  --from-literal=API_KEY_PEPPER="$(openssl rand -hex 32)" \
  --from-literal=RELAY_TOKEN="$(openssl rand -hex 24)" \
  --from-literal=OPEN_CONNECTOR_ENCRYPTION_KEY="$(openssl rand -hex 32)"
```

`API_KEY_PEPPER` is effectively permanent: rotating it invalidates existing daemon and personal API keys. The connector key encrypts connector OAuth credentials in its persistent volume and should exist before the first connection is created. Keep these values in your secret manager and use a URL-encoded database password.

The Kubernetes daemon pool has a separate data-plane document. It is the durable store for sessions, transcripts, queues, and other execution data shared by the pool members. Save this as `data-plane.json`:

```json
{
  "version": 1,
  "databaseUrl": "postgresql://daemon_pool:replace-me@postgres.example.test:5432/agentconnect",
  "maxConnections": 4
}
```

Create the Secret from that file:

```bash
kubectl -n agentconnect create secret generic agentconnect-data-plane \
  --from-file=config.json=./data-plane.json
```

The Control Plane and daemon pool may use the same PostgreSQL service. Keep their credentials separate so they can be scoped and rotated independently, and back up both control and execution data.

## 2. Create the values file

Start with a small override file rather than copying the complete chart defaults. Save this as `agentconnect-values.yaml` and replace the example host, Gateway listener, and StorageClass:

```yaml
publicUrl: https://app.example.test

route:
  # Keep the deployment private until Logto sign-in is configured.
  enabled: false
  gateway:
    name: public-gateway
    namespace: default
    sectionName: https

daemonPool:
  # The chart creates this namespace with restricted Pod Security labels and default-deny networking.
  sandboxNamespace: agentconnect-agents
  runtime:
    workspace:
      storageClass: standard
      size: 10Gi
```

`publicUrl` is the final browser origin. In the default same-origin topology, the console is served at `/`, the Control Plane at `/cp`, and Relay paths on the same host. The chart also supports dedicated `apiHost`, `mcpHost`, and `relay.host` values when you need separate public origins.

The daemon pool defaults to three members and three pre-warmed runtime sandboxes. Each warm sandbox holds a running pod and a workspace PVC. Set `daemonPool.runtime.warmReplicas: 0` when you prefer lower standing cost over a faster first agent launch.

### Encrypt stored application secrets

By default, write-only provider and agent secrets are plaintext at rest in PostgreSQL. Before entering production credentials in Setup or the console, configure a Vault Transit key and a Kubernetes-auth role bound to the chart's `agentconnect-control-plane` ServiceAccount. Then add the cipher settings to the same values file:

```yaml
controlPlane:
  config:
    SECRET_CIPHER: vault-transit
    VAULT_ADDR: https://vault.example.test
    VAULT_TRANSIT_KEY: agentconnect-cp
    VAULT_JWT_ROLE: agentconnect
```

Setup Server uses the same ServiceAccount and cipher configuration by default, so both processes seal and open the same values. See [Secret storage](/docs/deployment-and-configuration#secret-storage) for the Transit policy and migration behavior.

## 3. Install AgentConnect

Install the version you verified:

```bash
helm upgrade --install agentconnect \
  oci://ghcr.io/agentconnect-md/charts/agentconnect \
  --version "$AGENTCONNECT_CHART_VERSION" \
  --namespace agentconnect \
  --values agentconnect-values.yaml \
  --wait \
  --timeout 15m
```

On a fresh cluster, Helm installs the four `agent-sandbox` CRDs before the release, and the chart installs the pinned controller stack. The chart also creates the dedicated agents namespace, the daemon pool's TokenReview RBAC, the SandboxTemplate, and the warm pool.

Check the rollout:

```bash
kubectl -n agentconnect get pods
kubectl -n agentconnect-agents get pods,pvc
kubectl -n agentconnect logs deployment/agentconnect-control-plane -c migrate
```

The migration container should exit successfully, application pods should become Ready, and the agents namespace should contain the pre-warmed sandbox pods and PVCs.

## 4. Configure sign-in before publishing the route

Setup Server intentionally has no Service or public route. Forward it to your workstation:

```bash
kubectl -n agentconnect port-forward deployment/agentconnect-setup-server 8091:8091
```

Open [http://localhost:8091](http://localhost:8091), connect Logto, configure the browser application and first social provider, and claim the initial administrator. Follow [Logto authentication](/docs/logto-authentication) for the application, API Resource, and provider steps.

For Logto Cloud or an external Logto deployment, add its public endpoint to `agentconnect-values.yaml` before the install or upgrade:

```yaml
logto:
  endpoint: https://login.example.test
  # Set this separately when a custom login domain does not serve the Management API.
  mgmtEndpoint: https://tenant.example.test
```

After saving deployment settings in Setup, restart the services that load them at startup:

```bash
kubectl -n agentconnect rollout restart \
  deployment/agentconnect-control-plane \
  deployment/agentconnect-web \
  statefulset/agentconnect-relay
```

Wait for the rollout, change `route.enabled` to `true` in `agentconnect-values.yaml`, and apply the chart again:

```bash
helm upgrade agentconnect \
  oci://ghcr.io/agentconnect-md/charts/agentconnect \
  --version "$AGENTCONNECT_CHART_VERSION" \
  --namespace agentconnect \
  --values agentconnect-values.yaml \
  --wait \
  --timeout 15m
```

Confirm that the route attached to the intended Gateway:

```bash
kubectl -n agentconnect get httproute
kubectl -n agentconnect describe httproute agentconnect
```

If the parent Gateway is in another namespace, its listener must allow routes from the AgentConnect namespace.

## 5. Run the first agent

Open the final Web URL and sign in. The daemon pool registers itself as **Kubernetes cluster**, so you do not need to copy an **Add daemon** command or install the host CLI.

Create an agent, choose **Kubernetes cluster**, and select one of the runtimes reported by the runtime-sandbox image. Add the model credential expected by that runtime as an agent or organization secret; see [Variables & secrets](/docs/variables-and-secrets). Then run a message in the Playground and confirm that the agent receives a sandbox and persistent workspace.

## Operations

### Upgrade

Back up PostgreSQL and important workspace PVCs, choose the new release, and inspect its release notes. Helm does not upgrade CRDs from a chart's `crds/` directory, so apply the version-matched CRDs before upgrading the controller and application workloads:

```bash
export AGENTCONNECT_NEW_CHART_VERSION=X.Y.Z
export AGENTCONNECT_CHART_DIR="$(mktemp -d)"

helm pull oci://ghcr.io/agentconnect-md/charts/agentconnect \
  --version "$AGENTCONNECT_NEW_CHART_VERSION" \
  --untar \
  --untardir "$AGENTCONNECT_CHART_DIR"

kubectl apply --server-side \
  -f "$AGENTCONNECT_CHART_DIR/agentconnect/crds/agent-sandbox.yaml"

helm upgrade agentconnect \
  oci://ghcr.io/agentconnect-md/charts/agentconnect \
  --version "$AGENTCONNECT_NEW_CHART_VERSION" \
  --namespace agentconnect \
  --values agentconnect-values.yaml \
  --wait \
  --timeout 15m
```

The chart version already selects the matching application images. Leave `image.tag` and component tags empty unless you deliberately need a mixed-version deployment.

### Orphan cleanup

The daemon pool includes a scheduled reconciler for sandbox objects whose agents no longer exist. It defaults to dry-run mode. Review its summaries for an observation period before setting `daemonPool.reconciler.delete: true`: deleting an orphaned sandbox claim also deletes its workspace PVC and cannot be undone.

### Shared-cluster controller ownership

The `agent-sandbox` CRDs and controller are cluster-shared. A single AgentConnect release can own them on a dedicated cluster. If several AgentConnect releases share one cluster, manage the CRDs and controller once outside those releases, install each chart with `--skip-crds`, and set `installCRD: false`. Do not let several Helm releases compete for the same cluster-scoped controller stack.

## Troubleshooting

- **A pod stays in `ContainerCreating`:** check `kubectl describe pod`. The common causes are a missing `agentconnect-secrets` or `agentconnect-data-plane` Secret.
- **Daemon pool members never become Ready:** inspect their logs and confirm the data-plane PostgreSQL URL, the `agent-sandbox` controller, and the runtime warm pool are healthy.
- **Sandbox pods stay Pending:** verify the configured StorageClass, node architecture, capacity, node selectors, and tolerations.
- **An HTTPRoute is not Accepted:** inspect its status and the Gateway listener's hostname, `sectionName`, and allowed route namespaces.
- **The console returns `401` after sign-in:** verify that the Logto API Resource exactly matches the Control Plane audience; see [Logto authentication](/docs/logto-authentication#verify-the-setup).

For the complete value reference and a control-plane-only installation example, see the chart's [README](https://github.com/agentconnect-md/agentconnect/tree/main/charts/agentconnect).
