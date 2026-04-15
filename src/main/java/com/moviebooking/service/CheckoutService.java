package com.moviebooking.service;

import com.moviebooking.entity.Checkout;
import com.moviebooking.dto.CheckoutRequest;
import com.moviebooking.dto.CheckoutResponse;
import com.moviebooking.repository.CheckoutRepository;
import org.springframwork.beans.factory.annotation.Autowired;
import org.springbootframework.stereotype.Service;
import org.springbootframework.web.server.ResponseStatusException;
import org.springbootframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.List;

