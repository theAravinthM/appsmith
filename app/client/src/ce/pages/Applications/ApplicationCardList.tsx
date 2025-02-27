import type { ReactNode } from "react";
import React from "react";
import { Text } from "design-system";
import { useSelector } from "react-redux";

import CardList from "pages/Applications/CardList";
import { PaddingWrapper } from "pages/Applications/CommonElements";
import { NoAppsFound } from "@appsmith/pages/Applications";
import ApplicationCard from "pages/Applications/ApplicationCard";
import type { ApplicationPayload } from "@appsmith/constants/ReduxActionConstants";
import type { UpdateApplicationPayload } from "@appsmith/api/ApplicationApi";
import {
  APPLICATION_CARD_LIST_ZERO_STATE,
  createMessage,
} from "@appsmith/constants/messages";
import { getIsFetchingApplications } from "@appsmith/selectors/selectedWorkspaceSelectors";
import { getAssetUrl } from "@appsmith/utils/airgapHelpers";
import { ASSETS_CDN_URL } from "constants/ThirdPartyConstants";

interface ApplicationCardListProps {
  applications: ApplicationPayload[];
  canInviteToWorkspace: boolean;
  enableImportExport: boolean;
  hasCreateNewApplicationPermission: boolean;
  hasManageWorkspacePermissions: boolean;
  isMobile?: boolean;
  workspaceId: string;
  onClickAddNewButton: (workspaceId: string) => void;
  deleteApplication: (applicationId: string) => void;
  updateApplicationDispatch: (
    id: string,
    data: UpdateApplicationPayload,
  ) => void;
  title: string;
  emptyStateMessage?: string;
  titleTag?: ReactNode;
}

function ApplicationCardList({
  applications,
  canInviteToWorkspace,
  deleteApplication,
  emptyStateMessage,
  enableImportExport,
  hasCreateNewApplicationPermission,
  hasManageWorkspacePermissions,
  isMobile,
  title,
  titleTag,
  updateApplicationDispatch,
  workspaceId,
}: ApplicationCardListProps) {
  const isFetchingApplications = useSelector(getIsFetchingApplications);

  return (
    <CardList
      isLoading={isFetchingApplications}
      isMobile={isMobile}
      title={title}
      titleTag={titleTag}
    >
      {applications.map((application: any) => {
        return (
          <PaddingWrapper isMobile={isMobile} key={application.id}>
            <ApplicationCard
              application={application}
              delete={deleteApplication}
              enableImportExport={enableImportExport}
              isFetchingApplications={isFetchingApplications}
              isMobile={isMobile}
              key={application.id}
              permissions={{
                hasCreateNewApplicationPermission,
                hasManageWorkspacePermissions,
                canInviteToWorkspace,
              }}
              update={updateApplicationDispatch}
              workspaceId={workspaceId}
            />
          </PaddingWrapper>
        );
      })}
      {applications.length === 0 && (
        <NoAppsFound>
          <img
            className="mb-7"
            src={getAssetUrl(`${ASSETS_CDN_URL}/no-applications.svg`)}
          />
          <Text kind="heading-xs">
            {emptyStateMessage ||
              createMessage(APPLICATION_CARD_LIST_ZERO_STATE)}
          </Text>
          {/* below component is duplicate. This is because of cypress test were failing */}
        </NoAppsFound>
      )}
    </CardList>
  );
}

export default ApplicationCardList;
