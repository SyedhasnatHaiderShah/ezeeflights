/**
 * DOM Mutation Protection Patch for React 18 / 19 & Next.js
 * 
 * Prevents fatal unhandled exceptions:
 * - "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 * - "NotFoundError: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node."
 * 
 * These errors occur when Google Translate, Chrome auto-translation, browser extensions
 * (Grammarly, 1Password, LastPass, DarkReader, etc.), or third-party scripts modify,
 * wrap (e.g. <font> tags), or detach DOM nodes outside of React's virtual DOM reconciliation.
 */

if (typeof window !== "undefined" && typeof Node !== "undefined") {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child && child.parentNode !== this) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[DOM Fix] Cannot remove child because it is not a direct child of this node. Safely resolving removal:",
          child,
          this
        );
      }
      if (child.parentNode) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return originalRemoveChild.apply(this, [child]) as T;
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[DOM Fix] Cannot insert before referenceNode because it is not a child of this node. Safely resolving insertion:",
          referenceNode,
          this
        );
      }
      if (referenceNode.parentNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode) as T;
      }
      return originalInsertBefore.apply(this, [newNode, null]) as T;
    }
    return originalInsertBefore.apply(this, [newNode, referenceNode]) as T;
  };
}

export {};
