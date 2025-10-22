import { useTheme } from "@pancakeswap/hooks";
import { useTranslation } from "@pancakeswap/localization";
import { Box, TreeSelect, useMatchBreakpoints } from "@pancakeswap/uikit";
import type { TreeNode, TreeSelectChangeEvent, TreeSelectProps } from "@pancakeswap/uikit/components/TreeSelect";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";

const Container = styled(Box)<{ isShow: boolean }>`
  width: 100%;

  ${({ isShow, theme }) =>
    isShow &&
    `
  && .p-treeselect {
     border-bottom: 2px solid ${theme.colors.inputSecondary};
     border-bottom-left-radius: 0;
     border-bottom-right-radius: 0;
  }

  && .p-treeselect-panel {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
  }
 `}
  && .p-treeselect-panel {
    margin: -2px 0 0 -1px;
  }
`;

export const SELECTED_ALL = "all";
export const SELECTED_NONE = "none";

export const fromSelectedNodes = (
  data?: TreeNode[],
  selected?: string[],
  values_?: TreeSelectProps["value"]
): TreeSelectProps["value"] => {
  const values = values_ ?? {};
  if (!data || !selected || typeof values === "string" || Array.isArray(values)) {
    return values;
  }
  for (const node of data) {
    if (node.children) {
      fromSelectedNodes(node.children, selected, values);
    }
    if ((selected.includes(SELECTED_ALL) || selected.includes(node.data)) && node.key) {
      const isPartialChecked = node.children
        ? Object.keys(node.children).every((key) => {
            const childValue = values[key];
            return (
              childValue &&
              (typeof childValue === "boolean" ? childValue === true : childValue.checked && !childValue.partialChecked)
            );
          })
        : false;
      values[node.key] = {
        checked: true,
        partialChecked: isPartialChecked,
      };
    }
  }
  return values;
};

export const toSelectedNodes = (data?: TreeNode[], value?: TreeSelectProps["value"]) => {
  const selected: TreeNode[] = [];
  if (!data || !value || typeof value !== "object" || Array.isArray(value)) {
    return selected;
  }
  for (const node of data) {
    if (node.key && node.key in value) {
      const selectedValue = value[node.key];
      if (selectedValue === true || (typeof selectedValue === "object" && selectedValue.checked)) {
        selected.push(node);
      }
    }
    if (node.children) {
      selected.push(...toSelectedNodes(node.children, value));
    }
  }
  return selected;
};

export interface IPoolTypeFilterProps {
  data?: TreeNode[];
  value?: TreeSelectProps["value"];
  onChange?: (e: TreeSelectChangeEvent, selectedNodes?: TreeNode[]) => void;
}

export const PoolTypeFilter: React.FC<IPoolTypeFilterProps> = ({ data, onChange, value }) => {
  const [isShow, setIsShow] = useState(false);
  const [selectedNodeKey, setSelectedNodeKey] = useState<TreeSelectProps["value"]>(null);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<string>();
  const { isMobile } = useMatchBreakpoints();

  const handleTreeSelectChange = useCallback(
    (e: TreeSelectChangeEvent) => {
      if (onChange) {
        onChange(e);
      } else {
        setSelectedNodeKey(e.value);
      }
    },
    [onChange]
  );

  const resetWidth = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.style.overflow = "hidden";
    setWidth(getComputedStyle(containerRef.current).width);
    containerRef.current.style.overflow = "";
  }, []);

  useEffect(() => {
    resetWidth();
    window.addEventListener("resize", resetWidth);
    return () => window.removeEventListener("resize", resetWidth);
  }, [resetWidth]);

  return (
    <Container ref={containerRef} isShow={isShow}>
      <TreeSelect
        scrollHeight={isMobile ? "200px" : "320px"}
        data={data}
        style={{
          backgroundColor: theme.colors.input,
          width,
          maxWidth: "100%",
        }}
        panelStyle={{
          backgroundColor: theme.colors.input,
        }}
        value={value ?? selectedNodeKey}
        placeholder={t("All Pools")}
        onShow={() => setIsShow(true)}
        onHide={() => setIsShow(false)}
        onChange={handleTreeSelectChange}
      />
    </Container>
  );
};
