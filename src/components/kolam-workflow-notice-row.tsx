import React from 'react';
import type {WorkflowStep} from '../lib/workflow';
import {KolamCopyStack} from './kolam-copy-stack';
import {KolamInlineFrame} from './kolam-inline-frame';
import {workflowNoticeStyles as styles} from './kolam-workflow-notice-styles';

export function KolamWorkflowNoticeRow({step}: {step: WorkflowStep}) {
  return (
    <KolamInlineFrame variant="workflowNoticeRow">
      <KolamCopyStack
        items={[
          {
            id: 'dot',
            text: step.done ? 'OK' : '!',
            style: [styles.dot, step.done && styles.done],
          },
          {id: 'label', text: step.label, style: styles.text},
        ]}
      />
    </KolamInlineFrame>
  );
}