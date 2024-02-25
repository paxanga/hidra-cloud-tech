package tcp_test

import (
	"context"
	"testing"

	"github.com/hidracloud/hidra/v3/internal/plugins"
	"github.com/hidracloud/hidra/v3/internal/plugins/collector/tcp"
)

func TestScenario(t *testing.T) {
	h := &tcp.TCP{}
	h.Init()

	ctx := context.TODO()
	previous := make(map[string]any, 0)

	_, err := h.RunStep(ctx, previous, &plugins.Step{
		Name: "connectTo",
		Args: map[string]string{
			"to": "google.com:80",
		},
	})

	if err != nil {
		t.Error(err)
	}

	_, err = h.RunStep(ctx, previous, &plugins.Step{
		Name: "write",
		Args: map[string]string{
			"data": "SEVBRCAvIEhUVFAvMS4xDQoNCgo=",
		},
	})

	if err != nil {
		t.Error(err)
	}

	_, err = h.RunStep(ctx, previous, &plugins.Step{
		Name: "read",
		Args: map[string]string{},
	})

	if err != nil {
		t.Error(err)
	}
}
