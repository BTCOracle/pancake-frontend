import styled from "styled-components";

export const Path = styled.path<{ fill?: string; stroke?: string; opacity?: number }>`
  opacity: ${({ opacity }) => opacity || 1}};
  stroke: ${({ stroke }) => stroke ?? "none"};
  fill: ${({ fill }) => fill ?? "none"};
`;
