package handlers

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mocking the dependencies
type MockJobPostingService struct {
	mock.Mock
}

func (m *MockJobPostingService) CreateJobPosting(post JobPosting) (JobPosting, error) {
	args := m.Called(post)
	return args.Get(0).(JobPosting), args.Error(1)
}

// Test function
func TestCreateJobPosting(t *testing.T) {
	mockService := new(MockJobPostingService)
	handler := NewJobPostingHandler(mockService)

	t.Run("successful job posting creation", func(t *testing.T) {
		mockService.On("CreateJobPosting", mock.Anything).Return(JobPosting{ID: 1}, nil)

		req, err := http.NewRequest("POST", "/job-postings", nil)
		assert.NoError(t, err)

		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusCreated, rr.Code)
		mockService.AssertExpectations(t)
	})

	t.Run("failed job posting creation", func(t *testing.T) {
		mockService.On("CreateJobPosting", mock.Anything).Return(JobPosting{}, errors.New("some error"))

		req, err := http.NewRequest("POST", "/job-postings", nil)
		assert.NoError(t, err)

		rr := httptest.NewRecorder()
		handler.ServeHTTP(rr, req)

		assert.Equal(t, http.StatusInternalServerError, rr.Code)
		mockService.AssertExpectations(t)
	})
}
