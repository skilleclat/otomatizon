const { readDb, writeDb } = require("../db/server-db.cjs");
const { evaluateJobCondition } = require("./condition-evaluator.cjs");
const { WhatsAppConnector } = require("../connectors/whatsapp-connector.cjs");

const whatsAppConnector = new WhatsAppConnector();

class PersistentJobQueue {
  constructor() {
    this.intervalHandle = null;
  }

  /**
   * Initializes queue and bootstraps sample realistic scheduled jobs if empty
   */
  init() {
    const db = readDb();
    if (!db.scheduledJobs || db.scheduledJobs.length === 0) {
      db.scheduledJobs = [
        {
          id: "job_fu_01",
          organizationId: "org_james",
          workflowId: "wf_lead_autopilot",
          jobType: "follow_up_24h",
          targetEntityId: "lead_live_01",
          targetEntityName: "Mercy Chebet",
          targetPhone: "+254 719 552 108",
          scheduledFor: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // in 18 hours
          createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
          status: "scheduled",
          conditionDescription: "Cancel if Mercy Chebet books a slot or completes payment",
          payload: {
            subject: "French DELF B1 Tutoring",
            level: "Intermediate B1",
            requestedSlot: "Tuesday 16:00",
            followUpMessageText: "Bonjour Mercy ! Je voulais vérifier si vous aviez pu consulter la brochure de cours pour ce mardi 16h. J'ai encore 1 place disponible si vous souhaitez démarrer cette semaine ! — James",
            estimatedValueKes: 3500
          }
        },
        {
          id: "job_fu_02",
          organizationId: "org_james",
          workflowId: "wf_lead_autopilot",
          jobType: "follow_up_24h",
          targetEntityId: "lead_live_02",
          targetEntityName: "Brian Omondi",
          targetPhone: "+254 722 334 455",
          scheduledFor: new Date(Date.now() + 22 * 3600 * 1000).toISOString(), // in 22 hours
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          status: "scheduled",
          conditionDescription: "Cancel if Brian Omondi confirms lesson slot",
          payload: {
            subject: "Mathematics Coaching (CBC Grade 8)",
            level: "Grade 8",
            requestedSlot: "Saturday 10:00 AM",
            followUpMessageText: "Hi Brian! Following up on your Saturday 10am maths coaching request. Would you like me to hold this slot on Google Calendar for you? — James",
            estimatedValueKes: 3500
          }
        },
        {
          id: "job_pay_01",
          organizationId: "org_james",
          workflowId: "wf_payment_recovery",
          jobType: "payment_reminder_12h",
          targetEntityId: "lead_live_03",
          targetEntityName: "Sylvie Dubois",
          targetPhone: "+254 712 990 112",
          scheduledFor: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
          status: "scheduled",
          conditionDescription: "Cancel if M-Pesa tuition payment verified",
          payload: {
            subject: "French Tutoring (Grade 4e)",
            level: "Junior Secondary",
            requestedSlot: "Wednesday 15:00",
            followUpMessageText: "Bonjour Sylvie ! Petit rappel amical pour la séance de français de demain 15h. Vous pouvez finaliser le règlement via M-Pesa Till 174379 pour recevoir le lien Meet. Merci ! — James",
            estimatedValueKes: 3500
          }
        }
      ];
      writeDb(db);
    }
  }

  /**
   * Schedules a new delayed job in the persistent DB
   */
  scheduleJob(jobData) {
    const db = readDb();
    if (!db.scheduledJobs) db.scheduledJobs = [];

    const newJob = {
      id: `job_${Date.now()}`,
      organizationId: jobData.organizationId || "org_james",
      workflowId: jobData.workflowId || "wf_lead_autopilot",
      jobType: jobData.jobType || "follow_up_24h",
      targetEntityId: jobData.targetEntityId || `lead_${Date.now()}`,
      targetEntityName: jobData.targetEntityName || "Prospective Student",
      targetPhone: jobData.targetPhone || "+254 700 000 000",
      scheduledFor: jobData.scheduledFor || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      status: "scheduled",
      conditionDescription: jobData.conditionDescription || "Cancel if student books or pays",
      payload: jobData.payload || {}
    };

    db.scheduledJobs.push(newJob);
    writeDb(db);
    return newJob;
  }

  /**
   * Lists all jobs with calculated remaining time
   */
  listJobs() {
    const db = readDb();
    const now = Date.now();
    const jobs = db.scheduledJobs || [];

    return jobs.map(j => {
      const scheduledTime = new Date(j.scheduledFor).getTime();
      const diffMs = scheduledTime - now;
      const isDue = diffMs <= 0;

      let remainingHuman = "Due now";
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (3600 * 1000));
        const minutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
        remainingHuman = `In ${hours}h ${minutes}m`;
      }

      return {
        ...j,
        isDue,
        remainingHuman,
        remainingSeconds: Math.max(0, Math.floor(diffMs / 1000))
      };
    });
  }

  /**
   * Fast-Forwards / Triggers an individual job immediately (or on due time)
   */
  async executeJob(jobId, forceImmediate = false) {
    const db = readDb();
    if (!db.scheduledJobs) return null;

    const job = db.scheduledJobs.find(j => j.id === jobId);
    if (!job || (job.status !== "scheduled" && !forceImmediate)) {
      return null;
    }

    const evaluation = evaluateJobCondition(job, db);

    // Scenario A: Circuit breaker triggered (Student already converted)
    if (evaluation.circuitBroken) {
      job.status = "cancelled_converted";
      job.executionResult = {
        executedAt: new Date().toISOString(),
        circuitBroken: true,
        reason: evaluation.reason
      };

      const auditLog = {
        id: `act_${Date.now()}`,
        organizationId: job.organizationId,
        runId: `run_${Date.now()}`,
        type: "lead_follow_up",
        channel: "system",
        application: "Otomatizon Intelligence",
        title: `Follow-up stopped for ${job.targetEntityName} (Circuit Broken)`,
        description: evaluation.reason,
        actionTakenByOtomatizon: "Circuit breaker evaluated positive outcome and prevented duplicate message.",
        businessResult: "Zero spam · Customer conversion protected",
        entityName: job.targetEntityName,
        timestamp: "Just now",
        provenance: "OBSERVED"
      };

      if (!db.activityLogs) db.activityLogs = [];
      db.activityLogs.unshift(auditLog);
      writeDb(db);
      return { success: true, status: job.status, evaluation };
    }

    // Scenario B: Circuit breaker allows dispatch (Student needs polite follow-up)
    job.status = "dispatched";
    const followUpText = job.payload?.followUpMessageText || 
      `Hi ${job.targetEntityName}! Just checking in regarding your ${job.payload?.subject || "tutoring"} lesson request. I have an open slot this week if you'd like to reserve! — James`;

    const sendRes = await whatsAppConnector.sendTextMessage(job.targetPhone, followUpText);

    job.executionResult = {
      executedAt: new Date().toISOString(),
      circuitBroken: false,
      reason: evaluation.reason,
      messageId: sendRes.messageId
    };

    const auditLog = {
      id: `act_${Date.now()}`,
      organizationId: job.organizationId,
      runId: `run_${Date.now()}`,
      type: "lead_follow_up",
      channel: "whatsapp",
      application: "WhatsApp Business",
      title: `Automated 24h follow-up delivered to ${job.targetEntityName}`,
      description: `"${followUpText}"`,
      actionTakenByOtomatizon: "Automated 24h follow-up dispatched via WhatsApp API.",
      businessResult: "Opportunity re-engaged · KES 3,500 pipeline protected",
      entityName: job.targetEntityName,
      timestamp: "Just now",
      provenance: "OBSERVED"
    };

    if (!db.activityLogs) db.activityLogs = [];
    db.activityLogs.unshift(auditLog);

    // Update active workflow metrics
    const wf = (db.workflows && db.workflows[0]) || {};
    if (wf.metrics) {
      wf.metrics.leadsHelped = (wf.metrics.leadsHelped || 0) + 1;
      wf.metrics.hoursSaved = Math.round(((wf.metrics.hoursSaved || 0) + 0.35) * 10) / 10;
    }

    writeDb(db);
    return { success: true, status: job.status, executionResult: job.executionResult };
  }

  /**
   * Cancels a job manually
   */
  cancelJob(jobId) {
    const db = readDb();
    if (!db.scheduledJobs) return null;
    const job = db.scheduledJobs.find(j => j.id === jobId);
    if (!job) return null;

    job.status = "cancelled_manual";
    job.executionResult = {
      executedAt: new Date().toISOString(),
      circuitBroken: true,
      reason: "Manually cancelled by business owner in Otomatizon."
    };

    writeDb(db);
    return job;
  }

  /**
   * Periodic Tick (Evaluates and executes all due jobs)
   */
  async processDueJobs() {
    const jobs = this.listJobs();
    const dueJobs = jobs.filter(j => j.status === "scheduled" && j.isDue);

    for (const j of dueJobs) {
      await this.executeJob(j.id);
    }
  }

  startWorkerLoop(intervalMs = 15000) {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = setInterval(() => {
      this.processDueJobs().catch(err => console.error("[WorkerLoop] Error:", err.message));
    }, intervalMs);
  }

  stopWorkerLoop() {
    if (this.intervalHandle) clearInterval(this.intervalHandle);
    this.intervalHandle = null;
  }
}

const persistentJobQueue = new PersistentJobQueue();

module.exports = {
  PersistentJobQueue,
  persistentJobQueue
};
