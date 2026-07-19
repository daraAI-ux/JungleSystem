import React from 'react';
import {KolamCardFrame} from './kolam-card-frame';
import {KolamMappedList} from './kolam-mapped-list';
import {KolamWorkflowNoticeRow} from './kolam-workflow-notice-row';
import type {KolamWorkflowNoticeProps} from './kolam-workflow-notice-types';

export type {KolamWorkflowNoticeProps} from './kolam-workflow-notice-types';

export function KolamWorkflowNotice({steps}: KolamWorkflowNoticeProps) {
  return (
    <KolamCardFrame variant="workflowNotice">
      <KolamMappedList
        items={steps}
        getKey={step => step.label}
        renderItem={step => <KolamWorkflowNoticeRow step={step} />}
      />
    </KolamCardFrame>
  );
}