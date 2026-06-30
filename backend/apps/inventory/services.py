from apps.inventory.models import InventoryMovement


def record_inventory_movement(
    *,
    product,
    movement_type,
    previous_stock,
    new_stock,
    reason="",
    order=None,
    created_by=None,
):
    quantity_delta = int(new_stock) - int(previous_stock)
    if quantity_delta == 0:
        return None

    return InventoryMovement.objects.create(
        product=product,
        movement_type=movement_type,
        quantity_delta=quantity_delta,
        previous_stock=previous_stock,
        new_stock=new_stock,
        reason=reason,
        order=order,
        created_by=created_by,
    )
