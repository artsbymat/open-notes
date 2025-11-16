import * as React from "react";
import { ChevronRight, File, Folder } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButtonWithAutoClose,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar";
import Image from "next/image";
import Logo from "@/assets/logo.svg";
import Link from "next/link";

export function AppSidebar({ fileTree, ...props }) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/">
          <Image src={Logo} width={300} height={200} alt="logo" />
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="mx-0 px-2" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explorer</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {fileTree.map((node, index) => (
                <Tree key={index} node={node} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

function Tree({ node }) {
  const isFile = node.type === "file";

  // FILE
  if (isFile) {
    return (
      <SidebarMenuButton asChild className="h-fit">
        <SidebarMenuSubButtonWithAutoClose asChild>
          <Link href={node.slug || "#"}>
            <File />
            {node.name}
          </Link>
        </SidebarMenuSubButtonWithAutoClose>
      </SidebarMenuButton>
    );
  }

  // FOLDER
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={false}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {node.name}
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {node.children?.map((child, index) => (
              <Tree key={index} node={child} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
