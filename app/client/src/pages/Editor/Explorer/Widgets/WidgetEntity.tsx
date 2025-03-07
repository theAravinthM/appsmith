import React, { memo, useCallback, useMemo } from "react";
import WidgetFactory from "../../../../WidgetProvider/factory";
import Entity, { EntityClassNames } from "../Entity";
import type { WidgetProps } from "widgets/BaseWidget";
import type { WidgetType } from "constants/WidgetConstants";
import { useSelector } from "react-redux";
import WidgetContextMenu from "./WidgetContextMenu";
import { updateWidgetName } from "actions/propertyPaneActions";
import type { CanvasStructure } from "reducers/uiReducers/pageCanvasStructureReducer";
import { getLastSelectedWidget, getSelectedWidgets } from "selectors/ui";
import { useNavigateToWidget } from "./useNavigateToWidget";
import WidgetIcon from "./WidgetIcon";
import AnalyticsUtil from "@appsmith/utils/AnalyticsUtil";
import { builderURL } from "@appsmith/RouteBuilder";
import { useLocation } from "react-router";
import { getPagePermissions } from "selectors/editorSelectors";
import { NavigationMethod } from "utils/history";
import { getEntityExplorerWidgetsToExpand } from "selectors/widgetSelectors";
import { useFeatureFlag } from "utils/hooks/useFeatureFlag";
import { FEATURE_FLAG } from "@appsmith/entities/FeatureFlag";
import { getHasManagePagePermission } from "@appsmith/utils/BusinessFeatures/permissionPageHelpers";

export type WidgetTree = WidgetProps & { children?: WidgetTree[] };

const UNREGISTERED_WIDGETS: WidgetType[] = ["ICON_WIDGET"];

const useWidget = (
  widgetId: string,
  widgetType: WidgetType,
  pageId: string,
) => {
  const selectedWidgets = useSelector(getSelectedWidgets);
  const lastSelectedWidget = useSelector(getLastSelectedWidget);
  const isWidgetSelected = selectedWidgets.includes(widgetId);
  const multipleWidgetsSelected = selectedWidgets.length > 1;

  const { navigateToWidget } = useNavigateToWidget();

  const boundNavigateToWidget = useCallback(
    (e: any) => {
      const isMultiSelect = e.metaKey || e.ctrlKey;
      const isShiftSelect = e.shiftKey;
      navigateToWidget(
        widgetId,
        widgetType,
        pageId,
        NavigationMethod.EntityExplorer,
        isWidgetSelected,
        isMultiSelect,
        isShiftSelect,
      );
    },
    [widgetId, widgetType, pageId, isWidgetSelected, navigateToWidget],
  );

  return {
    navigateToWidget: boundNavigateToWidget,
    isWidgetSelected,
    multipleWidgetsSelected,
    lastSelectedWidget,
  };
};

export interface WidgetEntityProps {
  widgetId: string;
  widgetName: string;
  widgetType: WidgetType;
  step: number;
  pageId: string;
  childWidgets?: CanvasStructure[];
  parentModalId?: string;
  searchKeyword?: string;
  isDefaultExpanded?: boolean;
  widgetsInStep: string[];
}

export const WidgetEntity = memo((props: WidgetEntityProps) => {
  const widgetsToExpand = useSelector(getEntityExplorerWidgetsToExpand);
  // If the widget icon is a React component, then we get it from the Widget methods.
  const { IconCmp } = WidgetFactory.getWidgetMethods(props.widgetType);
  const icon = IconCmp ? <IconCmp /> : <WidgetIcon type={props.widgetType} />;
  const location = useLocation();

  const forceExpand = widgetsToExpand.includes(props.widgetId);

  const pagePermissions = useSelector(getPagePermissions);

  const isFeatureEnabled = useFeatureFlag(FEATURE_FLAG.license_gac_enabled);

  const canManagePages = getHasManagePagePermission(
    isFeatureEnabled,
    pagePermissions,
  );

  const {
    isWidgetSelected,
    lastSelectedWidget,
    multipleWidgetsSelected,
    navigateToWidget,
  } = useWidget(props.widgetId, props.widgetType, props.pageId);

  const { parentModalId, widgetId, widgetType } = props;
  /**
   * While navigating to a widget we need to show a modal if the widget is nested within it
   * Since the immediate parent for the widget would be a canvas instead of the modal,
   * so we track the immediate modal parent for the widget
   */
  const parentModalIdForChildren = useMemo(() => {
    return widgetType === "MODAL_WIDGET" ? widgetId : parentModalId;
  }, [widgetType, widgetId, parentModalId]);

  const switchWidget = useCallback(
    (e) => {
      AnalyticsUtil.logEvent("ENTITY_EXPLORER_CLICK", {
        type: "WIDGETS",
        fromUrl: location.pathname,
        toUrl: `${builderURL({
          pageId: props.pageId,
          hash: widgetId,
        })}`,
        name: props.widgetName,
      });
      navigateToWidget(e);
    },
    [location.pathname, props.pageId, widgetId, props.widgetName],
  );

  if (UNREGISTERED_WIDGETS.indexOf(props.widgetType) > -1) return null;

  const contextMenu = (
    <WidgetContextMenu
      canManagePages={canManagePages}
      className={EntityClassNames.CONTEXT_MENU}
      pageId={props.pageId}
      widgetId={props.widgetId}
    />
  );

  const showContextMenu = !multipleWidgetsSelected;
  const widgetsInStep = props?.childWidgets
    ? props?.childWidgets?.map((child) => child.widgetId)
    : [];

  return (
    <Entity
      action={switchWidget}
      active={isWidgetSelected}
      canEditEntityName={canManagePages}
      className="widget"
      contextMenu={showContextMenu && contextMenu}
      entityId={props.widgetId}
      forceExpand={forceExpand}
      highlight={lastSelectedWidget === props.widgetId}
      icon={icon}
      isDefaultExpanded={
        (!!props.searchKeyword && !!props.childWidgets) ||
        !!props.isDefaultExpanded
      }
      name={props.widgetName}
      searchKeyword={props.searchKeyword}
      showAddButton={canManagePages}
      step={props.step}
      updateEntityName={updateWidgetName}
    >
      {props.childWidgets &&
        props.childWidgets.length > 0 &&
        props.childWidgets.map((child) => (
          <WidgetEntity
            childWidgets={child.children}
            key={child.widgetId}
            pageId={props.pageId}
            parentModalId={parentModalIdForChildren}
            searchKeyword={props.searchKeyword}
            step={props.step + 1}
            widgetId={child.widgetId}
            widgetName={child.widgetName}
            widgetType={child.type}
            widgetsInStep={widgetsInStep}
          />
        ))}
    </Entity>
  );
});

WidgetEntity.displayName = "WidgetEntity";

export default WidgetEntity;
