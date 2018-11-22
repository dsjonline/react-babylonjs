import { CreatedInstance } from "../CreatedInstance"
import { LifecycleListener } from "../LifecycleListener"

export default class GUI3DControlLifecycleListener implements LifecycleListener {
  onParented(parent: CreatedInstance<any>, child: CreatedInstance<any>): any {}

  onChildAdded(child: CreatedInstance<any>, parent: CreatedInstance<any>): any {}

  onMount(instance: CreatedInstance<any>): void {
    if (instance.state && instance.state.added === true) {
      return
    }

    let addedParent: CreatedInstance<any> | null = null

    let tmp = instance.parent
    while (tmp) {
      if (tmp.metadata.isGUI3DControl === true) {
        if (tmp.state && tmp.state.added === true) {
          addedParent = tmp
          break
        }
      }
      tmp = tmp.parent
    }

    if (addedParent) {
      this.addControls(addedParent, addedParent)
    }
  }

  addControls(instance: CreatedInstance<any>, last3DGuiControl: CreatedInstance<any>) {
    const last3d: CreatedInstance<any> = instance.metadata.isGUI3DControl === true ? instance : last3DGuiControl

    instance.children.forEach(child => {
      if (last3d.customProps.childrenAsContent === true) {
        last3d.hostInstance.content = child.hostInstance // child.hostInstance will be GUI.Control (ie: 2D)
        child.state = { added: true, content: true }
      } else if (child.metadata.isGUI3DControl === true) {
        last3d.hostInstance.addControl(child.hostInstance)
        child.state = { added: true }
      }
    })

    if (instance.children.length > 0) {
      instance.children.forEach(child => {
        if(!child.state || child.state.content !== true) {
          if (child.state && child.state.added === true && child.customProps.onControlAdded) {
            child.customProps.onControlAdded(child)
          }

          this.addControls(child, last3d)
        }
      })
    }
  }
}
