import JSZip from 'jszip';
import { WorkflowDefinition, ApprovalCase, AuditLogEntry, AnalyticsData, ExecutionMode, WorkspaceType } from '../types';

interface WorkspaceData {
  workflows: WorkflowDefinition[];
  cases: ApprovalCase[];
  auditLogs: AuditLogEntry[];
  analytics: AnalyticsData;
  executionMode: ExecutionMode;
  activeWorkspace: WorkspaceType;
}

export async function generateWorkspaceZip(data: WorkspaceData) {
  const zip = new JSZip();

  const manifest = {
    appName: 'Operon',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    executionMode: data.executionMode,
    activeWorkspace: data.activeWorkspace,
    stats: {
      totalWorkflows: data.workflows.length,
      totalApprovalCases: data.cases.length,
      pendingApprovals: data.cases.filter((c) => c.status === 'pending').length,
      totalAuditLogs: data.auditLogs.length,
    },
  };

  // Add JSON files to ZIP root
  zip.file('operon-manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('workflows.json', JSON.stringify(data.workflows, null, 2));
  zip.file('approval-cases.json', JSON.stringify(data.cases, null, 2));
  zip.file('audit-logs.json', JSON.stringify(data.auditLogs, null, 2));
  zip.file('analytics.json', JSON.stringify(data.analytics, null, 2));

  // Add a documentation README in markdown
  const readmeContent = `# Operon Workspace Export

**Export Timestamp:** ${manifest.exportedAt}  
**Active Workspace:** ${manifest.activeWorkspace.toUpperCase()}  
**Execution Mode:** ${manifest.executionMode.toUpperCase()}  

---

### Included Files
1. **operon-manifest.json** - System metadata, version, and snapshot summary
2. **workflows.json** - Active multi-agent workflow definitions and step configurations
3. **approval-cases.json** - Release Guardian policy gate cases and human-in-the-loop decisions
4. **audit-logs.json** - Immutable audit trail of agent actions and human approvals
5. **analytics.json** - Operational performance, cost savings, and pass rate analytics

*Generated automatically by Operon Autonomous Ops Platform.*
`;

  zip.file('README.md', readmeContent);

  // Generate ZIP file blob and initiate client download
  const content = await zip.generateAsync({ type: 'blob' });
  const blobUrl = URL.createObjectURL(content);

  const link = document.createElement('a');
  link.href = blobUrl;
  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  link.download = `operon-workspace-snapshot-${dateStr}.zip`;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }, 100);
}
