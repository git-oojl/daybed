from rest_framework import serializers

from apps.access_control.services import PERMISSION_BY_CODE


class EmployeeRolePatchSerializer(serializers.Serializer):
    permission_codes = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
    )

    def validate_permission_codes(self, value):
        unknown_codes = sorted(set(value) - set(PERMISSION_BY_CODE))
        if unknown_codes:
            raise serializers.ValidationError(
                f"Unsupported employee permission codes: {', '.join(unknown_codes)}."
            )
        return sorted(set(value))

